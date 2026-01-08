import React from "react";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-neutral-900 mb-6">
          Ready to Launch Your Media Career?
        </h2>
        <p className="text-xl text-neutral-600 mb-10 leading-relaxed">
          Join thousands of students who have transformed their careers with our
          industry-leading media training programs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-secondary transition-colors duration-200 shadow-sm"
          >
            Get Started Today
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors duration-200"
          >
            View Courses
          </Link>
        </div>
        {/* <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-success"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-success"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>14-Day Free Trial</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-success"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Cancel Anytime</span>
          </div>
        </div> */}
      </div>
    </section>
  );
}
