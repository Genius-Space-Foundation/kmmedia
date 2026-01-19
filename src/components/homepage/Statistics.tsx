import React from "react";

const stats = [
  { label: "Active Students", value: "500+" },
  { label: "Expert Courses", value: "50+" },
  { label: "Success Rate", value: "95%" },
  { label: "Support Available", value: "24/7" },
];

export default function Statistics() {
  return (
    <section className="py-20 bg-brand-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="p-6">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-brand-primary-light font-medium text-lg opacity-90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
