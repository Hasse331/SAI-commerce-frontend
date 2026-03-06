export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  price: number;
  currency: string;
  image: string;
  images: string[];
  category: string;
  specs: {
    label: string;
    value: string;
  }[];
  features: string[];
  customizable: boolean;
}

export const products: Product[] = [
  {
    id: "signature-tube-amplifier",
    name: "Signature Tube Amplifier",
    tagline: "Pure analog warmth meets modern precision",
    description: "Handcrafted vacuum tube amplifier delivering 50W of pristine Class-A power. Each unit is individually tested and matched for optimal sonic performance.",
    story: "Born from a passion for analog warmth and modern clarity, the Signature Tube Amplifier represents our commitment to uncompromising audio fidelity. Every component is hand-selected, every solder joint inspected, every tube matched. This is not just an amplifier—it's a statement of intent.",
    price: 4500,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1767808481390-8dab51374476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoLWVuZCUyMGF1ZGlvJTIwYW1wbGlmaWVyfGVufDF8fHx8MTc3MjY1MTM5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1767808481390-8dab51374476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoLWVuZCUyMGF1ZGlvJTIwYW1wbGlmaWVyfGVufDF8fHx8MTc3MjY1MTM5OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1737885197946-6d9d79dade89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwYXVkaW8lMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNjUxMzk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1723536995929-02f231c2de6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFmdHNtYW5zaGlwJTIwd29ya3Nob3AlMjBlbGVjdHJvbmljc3xlbnwxfHx8fDE3NzI2NTEzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    category: "Amplifiers",
    specs: [
      { label: "Power Output", value: "50W Class-A" },
      { label: "Tubes", value: "4× EL34, 4× 12AX7" },
      { label: "Frequency Response", value: "10Hz - 45kHz (±0.5dB)" },
      { label: "THD", value: "<0.05% @ 1kHz" },
      { label: "Inputs", value: "3× RCA, 1× XLR" },
      { label: "Weight", value: "22kg" },
    ],
    features: [
      "Hand-matched NOS vacuum tubes",
      "Point-to-point wiring",
      "Aerospace-grade aluminum chassis",
      "Lifetime warranty on transformers",
      "Custom-wound output transformers",
    ],
    customizable: true,
  },
  {
    id: "precision-dac",
    name: "Precision DAC",
    tagline: "Digital to analog conversion perfected",
    description: "Reference-grade digital-to-analog converter featuring the latest ESS Sabre chipset and discrete analog stage. Experience your digital library like never before.",
    story: "We spent three years perfecting this design. Every trace on the circuit board is optimized. The power supply alone uses components that would fund an entire budget DAC. Why? Because digital music deserves to be heard in all its glory.",
    price: 3200,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1655560378499-1c57fde68345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpbyUyMHN0dWRpbyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzI2NTE0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1655560378499-1c57fde68345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpbyUyMHN0dWRpbyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzI2NTE0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1760842543713-108c3cadbba1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwY29tcG9uZW50cyUyMGNpcmN1aXQlMjBib2FyZHxlbnwxfHx8fDE3NzI2MzA1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    category: "Source",
    specs: [
      { label: "DAC Chip", value: "ESS ES9038PRO" },
      { label: "PCM Support", value: "Up to 32bit/768kHz" },
      { label: "DSD Support", value: "DSD512 native" },
      { label: "THD+N", value: "<0.0003%" },
      { label: "Outputs", value: "XLR, RCA" },
      { label: "Inputs", value: "USB, Optical, Coaxial, I2S" },
    ],
    features: [
      "Dual mono design",
      "Femto-clock oscillator",
      "Linear power supply",
      "Isolated USB input",
      "Discrete output stage",
    ],
    customizable: false,
  },
  {
    id: "heritage-phono-stage",
    name: "Heritage Phono Stage",
    tagline: "Your vinyl collection deserves this",
    description: "Fully discrete phono preamplifier supporting both MM and MC cartridges. Meticulously designed to extract every nuance from your vinyl collection.",
    story: "Vinyl isn't just a format—it's a ritual. The Heritage Phono Stage honors that ritual with circuitry inspired by the golden age of hi-fi, executed with modern precision and obsessive attention to detail.",
    price: 2800,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1603850121303-d4ade9e5ba65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMHBsYXllcnxlbnwxfHx8fDE3NzI1OTA5MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1603850121303-d4ade9e5ba65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMHBsYXllcnxlbnwxfHx8fDE3NzI1OTA5MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    category: "Source",
    specs: [
      { label: "Gain (MM/MC)", value: "40dB / 60dB" },
      { label: "Input Impedance", value: "47kΩ / 100Ω" },
      { label: "RIAA Accuracy", value: "±0.2dB" },
      { label: "SNR", value: ">86dB" },
      { label: "Outputs", value: "RCA, XLR" },
      { label: "Loading Options", value: "Adjustable" },
    ],
    features: [
      "Fully discrete topology",
      "Precision RIAA network",
      "Adjustable gain and loading",
      "Ultra-low noise design",
      "Shielded enclosure",
    ],
    customizable: true,
  },
  {
    id: "reference-headphone-amplifier",
    name: "Reference Headphone Amplifier",
    tagline: "Personal audio, perfected",
    description: "Desktop headphone amplifier capable of driving any headphone with authority and finesse. From high-impedance classics to planar magnetics.",
    story: "Headphones are intimate. They place the music directly into your consciousness. The Reference Headphone Amplifier was designed to honor that intimacy with transparent, powerful, and musical sound.",
    price: 1850,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1471174569907-e911cbbd6d5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBoZWFkcGhvbmVzfGVufDF8fHx8MTc3MjYxNzM1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1471174569907-e911cbbd6d5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBoZWFkcGhvbmVzfGVufDF8fHx8MTc3MjYxNzM1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    category: "Headphone Amplifiers",
    specs: [
      { label: "Output Power", value: "2W @ 32Ω" },
      { label: "Impedance Range", value: "16Ω - 600Ω" },
      { label: "THD+N", value: "<0.001%" },
      { label: "Gain", value: "Low: 0dB, High: +10dB" },
      { label: "Outputs", value: "6.35mm, 4.4mm balanced" },
      { label: "Input", value: "XLR, RCA" },
    ],
    features: [
      "Class-A output stage",
      "Balanced and single-ended outputs",
      "Relay-based input switching",
      "Alps volume potentiometer",
      "Zero feedback design",
    ],
    customizable: false,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
