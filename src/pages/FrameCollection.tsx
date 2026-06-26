import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface FrameModel {
  name: string;
  code: string;
  desc: string;
  image: string;
}

interface FrameType {
  id: string;
  name: string;
  tags: string;
  tagline: string;
  description: string;
  images: string[];
  models: FrameModel[];
}

const frameData: FrameType[] = [
  {
    id: 'rectangle',
    name: 'Rectangle Frames',
    tags: 'Modern • Professional • Everyday Wear',
    tagline: 'Structured, Bold & Professional',
    description: 'Often wider with sharp angles, flattering on most face shapes. A timeless choice for professionals and everyday wear.',
    images: ['/frames/rectangle.png', '/frames/rectangle_2.png'],
    models: [
      { name: 'Onyx Steel Rectangle', code: 'HB-RE-001', image: '/frames/rectangle.png', desc: 'Lightweight stainless steel frame in premium matte black.' },
      { name: 'Matte Wayfarer Rectangle', code: 'HB-RE-002', image: '/frames/wayfarer.png', desc: 'Full-rim sturdy frame with smooth rubberized acetate finish.' },
      { name: 'Gold Slim Rectangle', code: 'HB-RE-003', image: '/frames/rectangle_2.png', desc: 'Slim gold metallic full-rim frame, elegant and minimal.' },
    ]
  },
  {
    id: 'round',
    name: 'Round Frames',
    tags: 'Classic • Vintage • Intellectual',
    tagline: 'Soft Curves & Timeless Charm',
    description: 'Soft circular curves that soften angular features. Loved by artists, creatives, and vintage enthusiasts.',
    images: ['/frames/round.png', '/frames/round_2.png'],
    models: [
      { name: 'Crystal Clear Round', code: 'HB-RD-001', image: '/frames/round.png', desc: 'Transparent high-quality acetate with visible wire cores.' },
      { name: 'Rose Gold Wire Round', code: 'HB-RD-002', image: '/frames/round_2.png', desc: 'Chic ultra-thin metallic rose gold frame with soft nose pads.' },
    ]
  },
  {
    id: 'square',
    name: 'Square Frames',
    tags: 'Bold • Confident • Sharp',
    tagline: 'Sharp Angles & Distinct Definition',
    description: 'Strong angular lines that balance rounder face shapes with confidence and bold style.',
    images: ['/frames/square.png', '/frames/square_2.png'],
    models: [
      { name: 'Onyx Bold Square', code: 'HB-SQ-001', image: '/frames/square.png', desc: 'Thick-profile square frames with a strong architectural bridge.' },
      { name: 'Tortoise Bold Square', code: 'HB-SQ-002', image: '/frames/square_2.png', desc: 'Rich tortoiseshell acetate, bold angular corners, statement style.' },
    ]
  },
  {
    id: 'cateye',
    name: 'Cat-Eye Frames',
    tags: 'Elegant • Fashion • Premium',
    tagline: 'Retro Upswept Elegance',
    description: 'Dramatically upswept outer edges for a glamorous, fashion-forward look. A perennial favourite.',
    images: ['/frames/cateye.png', '/frames/cateye_2.png'],
    models: [
      { name: 'Vintage Tortoise Cat-Eye', code: 'HB-CE-001', image: '/frames/cateye.png', desc: 'Elegant upswept wings in classic amber-spotted tortoise shell.' },
      { name: 'Velvet Red Cat-Eye', code: 'HB-CE-002', image: '/frames/cateye_2.png', desc: 'Deep red acetate with silver hinge accents, dramatically upswept.' },
    ]
  },
  {
    id: 'aviator',
    name: 'Aviator Frames',
    tags: 'Iconic • Stylish • Timeless',
    tagline: 'Classic Teardrop Styling',
    description: 'Teardrop shape originally designed for pilots, now an iconic fashion staple for all occasions.',
    images: ['/frames/aviator.png', '/frames/aviator_2.png'],
    models: [
      { name: 'Maverick Gold Aviator', code: 'HB-AV-001', image: '/frames/aviator.png', desc: 'Thin double-bridge wireframe with iconic green-tint demo lenses.' },
      { name: 'Silver Blue Aviator', code: 'HB-AV-002', image: '/frames/aviator_2.png', desc: 'Silver titanium double bridge with cool light-blue tint lenses.' },
    ]
  },
  {
    id: 'geometric',
    name: 'Geometric Frames',
    tags: 'Trendy • Creative • Modern',
    tagline: 'Modern Artistry & Bold Lines',
    description: 'Unique polygonal shapes that add a modern, artistic touch. Perfect for bold, creative personalities.',
    images: ['/frames/geometric.png', '/frames/geometric_2.png'],
    models: [
      { name: 'Hexa-Bronze Geometric', code: 'HB-GM-001', image: '/frames/geometric.png', desc: 'Polygonal thin metal wireframe in a warm bronze finish.' },
      { name: 'Matte Black Hexagonal', code: 'HB-GM-002', image: '/frames/geometric_2.png', desc: 'Bold matte black six-sided frame for the modern creative.' },
    ]
  },
  {
    id: 'oversized',
    name: 'Oversized Frames',
    tags: 'Luxury • Statement • Fashion',
    tagline: 'Maximum Impact, Maximum Style',
    description: 'Large statement frames that exude luxury and fashion confidence. A runway-ready look.',
    images: ['/frames/oversized.png', '/frames/oversized_2.png'],
    models: [
      { name: 'Black Gold Oversized', code: 'HB-OV-001', image: '/frames/oversized.png', desc: 'Large bold statement frame in black acetate with gold accents.' },
      { name: 'Translucent Brown Oversized', code: 'HB-OV-002', image: '/frames/oversized_2.png', desc: 'Wide translucent brown acetate, fashion-forward and luxurious.' },
    ]
  },
  {
    id: 'rimless',
    name: 'Rimless Frames',
    tags: 'Minimal • Lightweight • Executive',
    tagline: 'Invisible, Effortless Elegance',
    description: 'Ultra-minimal frameless spectacles with titanium bridges. The most lightweight and executive look.',
    images: ['/frames/rimless.png', '/frames/rimless_2.png'],
    models: [
      { name: 'Titanium Rimless Executive', code: 'HB-RL-001', image: '/frames/rimless.png', desc: 'Ultra-thin titanium nose bridge and temples, minimal executive.' },
      { name: 'Gold Oval Rimless', code: 'HB-RL-002', image: '/frames/rimless_2.png', desc: 'Gold bridge, oval clear lenses, absolutely frameless luxury.' },
    ]
  },
];

interface FrameCollectionProps {
  frameTypeId: string;
  onBack: () => void;
}

export default function FrameCollection({ frameTypeId, onBack }: FrameCollectionProps) {
  const frameType = frameData.find(f => f.id === frameTypeId) || frameData[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold group"
        >
          <span className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </span>
          Back
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Himabindhu Opticals
        </div>
      </header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative px-6 py-16 overflow-hidden border-b border-slate-800 text-center"
      >
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {frameType.tags}
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase font-serif tracking-wider bg-linear-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
            {frameType.name}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            {frameType.description}
          </p>
        </div>
      </motion.div>

      {/* Models Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {frameType.models.map((model, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 14 } }
              }}
              whileHover={{ y: -10, transition: { duration: 0.25 } }}
              className="group bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative bg-white aspect-4/3 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-500 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-contain p-4 transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Details */}
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-black text-white text-sm leading-tight group-hover:text-amber-300 transition-colors duration-200 uppercase tracking-wide">
                      {model.name}
                    </h3>
                    <span className="text-[9px] bg-slate-950 border border-slate-800 text-amber-500 font-mono px-2 py-0.5 rounded-lg font-bold">
                      {model.code}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{model.desc}</p>
                </div>
                {/* Animated underline */}
                <div className="h-px bg-linear-to-r from-amber-500 to-transparent w-0 group-hover:w-full transition-all duration-500 rounded-full mt-2" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[11px] text-slate-600 uppercase tracking-[0.2em] font-semibold mt-16"
        >
          Visit our store to try on your perfect pair · Dharmavaram, Andhra Pradesh
        </motion.p>
      </div>
    </div>
  );
}

export { frameData };
