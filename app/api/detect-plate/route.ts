import { type NextRequest, NextResponse } from "next/server"
import { writeFile, unlink, mkdir } from "fs/promises"
import { join } from "path"
import { spawn } from "child_process"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  let tempImagePath: string | null = null

  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "Aucune image fournie" }, { status: 400 })
    }

    // Créer un fichier temporaire pour l'image
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const filename = `temp_${timestamp}.${image.name.split(".").pop()}`
    tempImagePath = `/tmp/${filename}`

    // Sauvegarder l'image temporairement
    await writeFile(tempImagePath, buffer)

    // Exécuter le script Python
    const result = await runPythonScript(tempImagePath)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur lors du traitement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du traitement de l'image",
        message: "Une erreur interne s'est produite",
      },
      { status: 500 },
    )
  } finally {
    // Nettoyer le fichier temporaire
    if (tempImagePath) {
      try {
        await unlink(tempImagePath)
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier temporaire:", error)
      }
    }
  }
}

const runPythonScript = (imagePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [join(process.cwd(), "scripts", "yolo_detection.py"), imagePath])

    let output = ""
    let errorOutput = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          // Nettoyer l'output en supprimant les caractères de contrôle et les espaces
          const cleanOutput = output.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '').replace(/^\s+|\s+$/g, '')
          
          // Vérifier si l'output commence par { (JSON valide)
          if (!cleanOutput.startsWith('{')) {
            console.error("Output invalide:", cleanOutput.substring(0, 100))
            reject(new Error(`Output Python invalide: ${cleanOutput.substring(0, 100)}`))
            return
          }
          
          const result = JSON.parse(cleanOutput)
          resolve(result)
        } catch (error) {
          console.error("Erreur de parsing JSON:", error)
          console.error("Output reçu:", output.substring(0, 200))
          reject(new Error(`Erreur de parsing JSON: ${error}. Output: ${output.substring(0, 100)}`))
        }
      } else {
        console.error("Erreur Python:", errorOutput)
        reject(new Error(`Script Python échoué avec le code ${code}: ${errorOutput}`))
      }
    })

    pythonProcess.on("error", (error) => {
      reject(new Error(`Erreur d'exécution Python: ${error.message}`))
    })
  })
}
