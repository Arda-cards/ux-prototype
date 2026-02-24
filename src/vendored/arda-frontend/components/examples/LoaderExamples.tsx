'use client';

import React, { useState } from 'react';
import { Button } from '@frontend/components/ui/button';
import { Loader } from '@frontend/components/ui/loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card';

export function LoaderExamples() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSubmitting(false);
  };

  const handlePageLoad = async () => {
    setIsPageLoading(true);
    // Simulate page load
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPageLoading(false);
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size="lg" aria-label="Loading page content" />
          <p className="text-gray-600 mt-4">Loading page content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Loader Component Examples</h1>
        <p className="text-gray-600">UX Loader Spec #179 Implementation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Size Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Loader Sizes</CardTitle>
            <CardDescription>Different size variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <Loader size="sm" />
                <p className="text-sm mt-2">Small</p>
              </div>
              <div className="text-center">
                <Loader size="default" />
                <p className="text-sm mt-2">Default</p>
              </div>
              <div className="text-center">
                <Loader size="lg" />
                <p className="text-sm mt-2">Large</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Loading Example */}
        <Card>
          <CardHeader>
            <CardTitle>Form Submission</CardTitle>
            <CardDescription>Button with loading state</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleFormSubmit} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Form'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Page Loading Example */}
        <Card>
          <CardHeader>
            <CardTitle>Page Loading</CardTitle>
            <CardDescription>Full page loading state</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePageLoad} className="w-full">
              Simulate Page Load
            </Button>
          </CardContent>
        </Card>

        {/* Inline Loading Example */}
        <Card>
          <CardHeader>
            <CardTitle>Inline Loading</CardTitle>
            <CardDescription>Loading within content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>This is some content with an inline loader:</p>
              <div className="flex items-center justify-center p-4 border rounded">
                <Loader size="sm" />
                <span className="ml-2">Processing data...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Styling Example */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Styling</CardTitle>
            <CardDescription>Loader with custom classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded">
              <Loader 
                size="default" 
                className="opacity-75"
                aria-label="Custom styled loader"
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Example */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>Screen reader friendly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Loader aria-label="Loading user profile" />
              <p className="text-sm text-gray-600">
                This loader includes proper ARIA labels for screen readers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Design Token Information */}
      <Card>
        <CardHeader>
          <CardTitle>Design Token Integration</CardTitle>
          <CardDescription>Using CSS custom properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">CSS Implementation:</h4>
              <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`.loader:after {
  box-shadow: 0 2px 0 var(--base-primary, #FF3D00) inset;
  animation: rotate 2s linear infinite;
}`}
              </pre>
            </div>
            <p className="text-sm text-gray-600">
              The loader uses <code>var(--base-primary)</code> design token with a fallback color.
              This ensures consistency with your design system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
