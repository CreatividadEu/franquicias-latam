import type { Metadata } from 'next'
import { GrowthV2Shell } from '@/components/growth-v2/GrowthV2Shell'

export const metadata: Metadata = {
  title: 'Growth Intelligence System | Diagnóstico Estratégico',
  description:
    'Tu negocio fue detectado por nuestro radar. Evaluación estratégica interactiva para identificar tu restricción dominante y la ruta correcta de crecimiento.',
}

export default function GrowthIntelligenceV2Page() {
  return <GrowthV2Shell />
}
