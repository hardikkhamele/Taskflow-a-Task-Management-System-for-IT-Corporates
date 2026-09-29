import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, RefreshCw } from 'lucide-react';

const ImageCropModal = ({ isOpen, imageSrc, onCropComplete, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageSrc && isOpen) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
        drawPreview(img, 1, 0, { x: 0, y: 0 });
      };
    }
  }, [imageSrc, isOpen]);

  const drawPreview = (img, scale, rot, pos) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Fill clean white background - no black borders!
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + pos.x, height / 2 + pos.y);
    ctx.rotate((rot * Math.PI) / 180);

    // Calculate aspect cover scale so image fills viewport cleanly
    const coverScale = Math.max(width / img.width, height / img.height) * scale;
    ctx.scale(coverScale, coverScale);

    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  };

  useEffect(() => {
    if (imageRef.current) {
      drawPreview(imageRef.current, zoom, rotation, offset);
    }
  }, [zoom, rotation, offset]);

  // Mouse Dragging to Pan Image
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate clean 300x300 JPEG data URL result with no black borders
  const handleSave = () => {
    const img = imageRef.current;
    if (!img) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 300;
    exportCanvas.height = 300;
    const ctx = exportCanvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);

    ctx.save();
    ctx.translate(150 + offset.x, 150 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);

    const coverScale = Math.max(300 / img.width, 300 / img.height) * zoom;
    ctx.scale(coverScale, coverScale);

    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    const croppedResult = exportCanvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedResult);
    onClose();
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-blue-600">
            <Move className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Crop & Adjust Profile Photo</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Canvas Viewport */}
        <div className="relative w-[280px] h-[280px] mx-auto bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center cursor-move select-none border border-slate-200">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full object-cover"
          />

          {/* Circular Overlay Mask Guide */}
          <div className="absolute inset-0 pointer-events-none border-[35px] border-slate-900/60 rounded-full"></div>
          <div className="absolute inset-0 pointer-events-none border-2 border-white/80 rounded-full m-[34px] shadow-xs"></div>
        </div>

        <p className="text-[11px] text-center text-slate-400 font-medium">
          Drag image to center face inside the circle • Adjust zoom & rotation below
        </p>

        {/* Adjustment Controls */}
        <div className="space-y-4 pt-1">
          {/* Zoom Slider */}
          <div className="flex items-center space-x-3">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center space-x-1 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl inline-flex items-center space-x-1 transition-colors"
                title="Reset adjustments"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center space-x-1 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Apply Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
