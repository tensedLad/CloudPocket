"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import { cn } from "../../lib/utils"

interface Feature {
    name: string
    description: string
    included: boolean
}

interface PricingTier {
    name: string
    price: {
        monthly: number
        yearly: number
    }
    description: string
    features: Feature[]
    highlight?: boolean
    badge?: string
    icon: React.ReactNode
}

interface PricingSectionProps {
    tiers: PricingTier[]
    className?: string
}

function PricingSection({ tiers, className }: PricingSectionProps) {
    const [isYearly, setIsYearly] = useState(false)

    const buttonStyles = {
        default: cn(
            "h-12 rounded-full !bg-white shadow-none",
            "text-zinc-900",
            "!border !border-solid !border-zinc-300",
            "text-sm font-medium",
            "hover:!bg-zinc-50",
        ),
        highlight: cn(
            "h-12 rounded-full bg-zinc-900 shadow-none",
            "text-white",
            "font-semibold text-base",
            "hover:bg-zinc-800 hover:text-white",
        ),
    }

    const badgeStyles = cn(
        "px-4 py-1.5 text-sm font-medium",
        "bg-zinc-900 dark:bg-zinc-100",
        "text-white dark:text-zinc-900",
        "border-none",
    )

    return (
        <section
            className={cn(
                "relative bg-background text-foreground",
                "py-12 px-4 md:py-24 lg:py-32",
                "overflow-hidden",
                className,
            )}
        >
            <div className="w-full max-w-5xl mx-auto">
                <div className="flex flex-col items-center gap-4 mb-12">
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        Simple, transparent pricing
                    </h2>
                    <div className="relative inline-flex items-center p-1.5 bg-white dark:bg-zinc-800/50 rounded-full border border-zinc-200 dark:border-zinc-700">
                        {/* Sliding Background */}
                        <motion.div
                            className="absolute bg-zinc-900 dark:bg-zinc-100 rounded-full shadow-lg"
                            initial={false}
                            animate={{
                                x: isYearly ? "100%" : "0%",
                                width: "calc(50% - 6.5px)",
                                height: "calc(100% - 12px)",
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            style={{
                                left: "6px",
                                top: "6px",
                            }}
                        />

                        {["Monthly", "Yearly"].map((period) => {
                            const active = (period === "Yearly") === isYearly
                            return (
                                <button
                                    key={period}
                                    onClick={() => setIsYearly(period === "Yearly")}
                                    className={cn(
                                        "relative z-10 px-8 py-2.5 text-sm font-medium rounded-full transition-colors duration-200",
                                        active
                                            ? "text-white dark:text-zinc-900"
                                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                                    )}
                                >
                                    {period}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={cn(
                                "relative group backdrop-blur-sm",
                                "rounded-3xl transition-all duration-300",
                                "flex flex-col",
                                "bg-zinc-50/50 dark:bg-zinc-900/50",
                                "border",
                                tier.highlight
                                    ? "border-zinc-400/50 dark:border-zinc-400/20"
                                    : "border-zinc-200 dark:border-zinc-700",
                                "hover:translate-y-0",
                            )}
                        >
                            {tier.badge && tier.highlight && (
                                <div className="absolute -top-4 left-6">
                                    <Badge className={badgeStyles}>{tier.badge}</Badge>
                                </div>
                            )}

                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className={cn(
                                            "text-zinc-900 dark:text-zinc-100",
                                        )}
                                    >
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                        {tier.name}
                                    </h3>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                                            ₹{isYearly ? tier.price.yearly : tier.price.monthly}
                                        </span>
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            /{isYearly ? "year" : "month"}
                                        </span>
                                    </div>
                                    {tier.description && (
                                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            {tier.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {tier.features.map((feature) => (
                                        <div key={feature.name} className="flex gap-4">
                                            <div
                                                className={cn(
                                                    "mt-1 p-0.5 rounded-full transition-colors duration-200",
                                                    feature.included
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-red-500 dark:text-red-400",
                                                )}
                                            >
                                                {feature.included ? (
                                                    <CheckIcon className="w-4 h-4" />
                                                ) : (
                                                    <Cross2Icon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {feature.name}
                                                </div>
                                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {feature.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 pt-0 mt-auto">
                                <Button
                                    variant={tier.highlight ? "default" : "outline"}
                                    className={cn(
                                        "w-full relative transition-all duration-300",
                                        tier.highlight
                                            ? buttonStyles.highlight
                                            : buttonStyles.default,
                                    )}
                                >
                                    {tier.highlight ? "Get Pro" : "Get Started"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export { PricingSection }
