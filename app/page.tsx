'use client'
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import HeroBanner from "./components/home/hero-banner"
import FeaturedServicesSection from "./components/home/featureSection"
import HowItWorks from "./components/home/how-it-works"
import CategorySection from "./components/home/category-section"
import WhyChooseSection from "./components/home/why-choose"

export default function Page() {
  return (
    <div >
      <HeroBanner/>
      <FeaturedServicesSection></FeaturedServicesSection> 
      <HowItWorks /> 

      <CategorySection />
      <WhyChooseSection />
    </div>
  )
}
