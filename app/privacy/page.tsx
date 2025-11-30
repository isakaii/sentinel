import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Sentinel',
  description: 'Privacy Policy for Sentinel academic calendar management application',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: November 29, 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sentinel (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your information
                when you use our academic calendar management application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Information We Collect
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                We collect the following types of information:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>
                  <strong>Account Information:</strong> Email address and name when you create an account.
                </li>
                <li>
                  <strong>Course Data:</strong> Syllabus files you upload and the extracted course information
                  (course names, assignments, exam dates, deadlines).
                </li>
                <li>
                  <strong>Google Account Data:</strong> If you connect your Google account, we access your
                  Google Calendar to create and manage course calendars on your behalf. We only access
                  calendar data necessary for creating and syncing your course events.
                </li>
                <li>
                  <strong>Usage Preferences:</strong> Your theme preference (light/dark mode) and
                  notification timing settings.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>To provide and maintain the Sentinel service</li>
                <li>To extract and organize academic deadlines from your syllabi</li>
                <li>To sync your course events with Google Calendar (when authorized)</li>
                <li>To send you deadline reminders based on your notification preferences</li>
                <li>To improve our service and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Google Calendar Integration
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                When you connect your Google account, Sentinel requests access to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>
                  <strong>Google Calendar API:</strong> To create new calendars for your courses and
                  add/update/delete events. We only modify calendars that Sentinel creates.
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-3">
                You can disconnect your Google account at any time through the Settings menu,
                which will revoke our access to your Google Calendar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Data Storage and Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is stored securely using industry-standard encryption. Syllabus files
                are processed to extract course information and are stored securely. We implement
                appropriate security measures to protect against unauthorized access, alteration,
                disclosure, or destruction of your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Data Sharing
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We do not sell, trade, or otherwise transfer your personal information to third
                parties. We may use third-party services (such as OpenAI for syllabus processing)
                that process your data according to their respective privacy policies. These
                services are used solely to provide the core functionality of Sentinel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Your Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Disconnect third-party integrations (Google Calendar)</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We retain your data for as long as your account is active. If you delete your
                account, we will delete your personal information and course data within 30 days,
                except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the
                &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <a
                  href="mailto:support@sentinel-edu.vercel.app"
                  className="text-red-700 dark:text-red-400 hover:underline"
                >
                  support@sentinel-edu.vercel.app
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a
              href="/"
              className="text-red-700 dark:text-red-400 hover:underline font-medium"
            >
              &larr; Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
