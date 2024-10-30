'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type Point = { x: number; y: number; color: string }

const CANVAS_SIZE = 400

export function DrawDataScatter() {
  const [points, setPoints] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('blue')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
        points.forEach((point) => {
          ctx.fillStyle = point.color
          ctx.beginPath()
          ctx.arc(point.x, CANVAS_SIZE - point.y, 3, 0, 2 * Math.PI)
          ctx.fill()
        })
      }
    }
  }, [points])

  const addPoint = (x: number, y: number) => {
    setPoints([...points, { x, y, color: currentColor }])
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = CANVAS_SIZE - (e.clientY - rect.top)
      addPoint(x, y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = CANVAS_SIZE - (e.clientY - rect.top)
      addPoint(x, y)
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleReset = () => {
    setPoints([])
  }

  const handleDownloadCSV = () => {
    const csv = 'x,y,color\n' + points.map(p => `${p.x},${p.y},${p.color}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scatter_data.csv'
    a.click()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Scatterplot Data Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={handleReset}>Reset</Button>
            <Button onClick={handleDownloadCSV}>Download CSV</Button>
          </div>
          <RadioGroup defaultValue="blue" onValueChange={(value) => setCurrentColor(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="blue" id="blue" />
              <Label htmlFor="blue">Blue</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="red" id="red" />
              <Label htmlFor="red">Red</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="green" id="green" />
              <Label htmlFor="green">Green</Label>
            </div>
          </RadioGroup>
          <div className="flex space-x-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="border border-gray-300"
              aria-label="Drawing canvas for scatter plot points"
            />
            <div className="w-[400px] h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="x" name="x" domain={[0, CANVAS_SIZE]} />
                  <YAxis type="number" dataKey="y" name="y" domain={[0, CANVAS_SIZE]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Points" data={points}>
                    {points.map((point, index) => (
                      <circle key={index} cx={point.x} cy={point.y} r={3} fill={point.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}