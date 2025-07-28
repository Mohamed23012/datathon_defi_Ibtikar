"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Camera, CheckCircle, AlertCircle, Loader2, Download, FileImage, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface Detection {
  confidence: number
  bbox: number[]
  class: number
  plate_image?: string
  extracted_text?: string
}

interface ExtractedPlate {
  id: number
  confidence: number
  image: string
  extracted_text?: string
}

interface DetectionResult {
  success: boolean
  annotated_image?: string
  detections?: Detection[]
  extracted_plates?: ExtractedPlate[]
  message: string
  error?: string
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const processImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)

      const response = await fetch("/api/detect-plate", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Erreur lors du traitement")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du traitement de l'image. Veuillez réessayer.")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadAnnotatedImage = () => {
    if (result?.annotated_image) {
      const link = document.createElement("a")
      link.href = result.annotated_image
      link.download = `plaque_detectee_${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadPlateImage = (plateImage: string, index: number) => {
    const link = document.createElement("a")
    link.href = plateImage
    link.download = `plaque_extraite_${index + 1}_${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Image src="/images/ibtikar-logo.png" alt="IBTIKAR" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Reconnaissance de Plaques</h1>
                  <p className="text-sm text-slate-600">Système Mauritanien</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Image
                src="/images/es-data-club-logo.png"
                alt="ES DATA CLUB"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileImage className="h-5 w-5 text-blue-600" />
                  <span>Upload d'Image</span>
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Sélectionnez une image contenant une plaque d'immatriculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-700 mb-2">Cliquez ou glissez-déposez</p>
                      <p className="text-sm text-slate-500">JPG, PNG, WEBP (max 10MB)</p>
                    </div>
                  </div>
                  <input id="file-input" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>

                {previewUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-slate-700">Aperçu</h3>
                      <span className="text-xs text-slate-500">
                        {selectedFile?.name}
                      </span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={previewUrl} alt="Aperçu" className="w-full h-48 object-cover" />
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <Button 
                    onClick={processImage} 
                    disabled={isProcessing} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Analyser l'Image
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Guide d'utilisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-slate-600">Sélectionnez une image claire avec une plaque d'immatriculation mauritanienne</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-slate-600">Cliquez sur "Analyser l'Image" pour démarrer la détection</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm text-slate-600">Consultez les résultats et téléchargez les plaques extraites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Résultats de l'Analyse</span>
                </CardTitle>
                <CardDescription>Détection et extraction des plaques d'immatriculation</CardDescription>
              </CardHeader>
              <CardContent>
                {!result && !error && !isProcessing && (
                  <div className="text-center py-16">
                    <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Camera className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Aucune analyse effectuée</h3>
                    <p className="text-slate-500">Téléchargez une image pour commencer l'analyse</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-16">
                    <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Analyse en cours...</h3>
                    <p className="text-slate-500">
                      Notre IA analyse votre image pour détecter les plaques d'immatriculation
                    </p>
                  </div>
                )}

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {result && result.success && (
                  <div className="space-y-6">
                    {/* Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">{result.message}</span>
                        </div>
                        {result.annotated_image && (
                          <Button
                            onClick={downloadAnnotatedImage}
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-100"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Image annotée */}
                    {result.annotated_image && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-700">Image avec détections</h3>
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                          <img
                            src={result.annotated_image}
                            alt="Image avec détections"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Plaques extraites */}
                    {result.extracted_plates && result.extracted_plates.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-700">Plaques extraites</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {result.extracted_plates.map((plate, index) => (
                            <div key={plate.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-slate-700">Plaque #{index + 1}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-green-600 font-bold">
                                    {Math.round(plate.confidence * 100)}%
                                  </span>
                                  <Button
                                    onClick={() => downloadPlateImage(plate.image, index)}
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="relative rounded overflow-hidden border border-slate-200 bg-slate-50 mb-3">
                                <img
                                  src={plate.image}
                                  alt={`Plaque extraite ${index + 1}`}
                                  className="w-full h-32 object-contain"
                                />
                              </div>
                              {plate.extracted_text && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-xs font-medium text-blue-700">Texte extrait :</span>
                                  </div>
                                  <p className="text-sm font-mono text-blue-800 bg-white px-2 py-1 rounded border">
                                    {plate.extracted_text}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Détails des détections */}
                    {result.detections && result.detections.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-700">Détails des détections</h3>
                        <div className="space-y-2">
                          {result.detections.map((detection, index) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">Plaque #{index + 1}</span>
                                <span className="text-sm text-green-600 font-bold">
                                  {Math.round(detection.confidence * 100)}%
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Position: [{Math.round(detection.bbox[0])}, {Math.round(detection.bbox[1])},{" "}
                                {Math.round(detection.bbox[2])}, {Math.round(detection.bbox[3])}]
                              </p>
                              {detection.extracted_text && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <p className="text-xs text-slate-600 mb-1">Texte extrait :</p>
                                  <p className="text-sm font-mono text-slate-800 bg-white px-2 py-1 rounded border">
                                    {detection.extracted_text}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-between mb-4">
              <div className="px-6 py-3 bg-slate-50 rounded-lg border border-slate-200">
                <Image src="/images/ibtikar-logo.png" alt="IBTIKAR" width={50} height={35} className="object-contain" />
              </div>
              <div className="px-6 py-3 bg-slate-50 rounded-lg border border-slate-200">
                <Image
                  src="/images/es-data-club-logo.png"
                  alt="ES DATA CLUB"
                  width={50}
                  height={35}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-slate-600">© 2024 Système de Reconnaissance de Plaques d'Immatriculation</p>
            <p className="text-xs text-slate-500 mt-1">Développé en partenariat avec IBTIKAR et ES DATA CLUB</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
