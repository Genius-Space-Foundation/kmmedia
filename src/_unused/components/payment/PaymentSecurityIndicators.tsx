"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  CheckCircle,
  CreditCard,
  Eye,
  Server,
  Globe,
  Award,
} from "lucide-react";

interface SecurityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  verified: boolean;
}

interface PaymentSecurityIndicatorsProps {
  className?: string;
  compact?: boolean;
}

export default function PaymentSecurityIndicators({
  className,
  compact = false,
}: PaymentSecurityIndicatorsProps) {
  const securityFeatures: SecurityFeature[] = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "SSL Encryption",
      description: "256-bit SSL encryption protects your data",
      verified: true,
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "PCI Compliant",
      description: "We never store your card details",
      verified: true,
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Fraud Protection",
      description: "Advanced fraud detection and prevention",
      verified: true,
    },
    {
      icon: <Server className="h-5 w-5" />,
      title: "Secure Servers",
      description: "Bank-grade security infrastructure",
      verified: true,
    },
  ];

  const trustBadges = [
    {
      name: "Paystack",
      description: "Certified Payment Partner",
      logo: "🏦",
    },
    {
      name: "SSL Secured",
      description: "256-bit Encryption",
      logo: "🔒",
    },
    {
      name: "PCI DSS",
      description: "Level 1 Compliant",
      logo: "✅",
    },
  ];

  if (compact) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center space-x-6 py-4">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-lg">{badge.logo}</span>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-900">
                  {badge.name}
                </p>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Security Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                Your Payment is Secure
              </h3>
              <p className="text-sm text-green-700">
                Protected by industry-leading security measures
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                  <div className="text-green-600">{feature.icon}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-green-900">
                      {feature.title}
                    </h4>
                    {feature.verified && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-green-700">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Trusted Payment Partners
            </h4>
            <p className="text-sm text-gray-600">
              We work with certified payment providers to ensure your security
            </p>
          </div>

          <div className="flex items-center justify-center space-x-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-2">
                  <span className="text-2xl">{badge.logo}</span>
                </div>
                <p className="text-xs font-medium text-gray-900">
                  {badge.name}
                </p>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Promise */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <Award className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Our Security Promise
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We never store your payment information</li>
              <li>• All transactions are monitored for fraud</li>
              <li>• Your data is encrypted end-to-end</li>
              <li>• 24/7 security monitoring and support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Questions about payment security?{" "}
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Contact our support team
          </button>
        </p>
      </div>
    </div>
  );
}
