import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import {ThemeProvider} from '@/components/theme-provider'
import {NavigationHeader} from '@/components/navigation-header'
import {Toaster} from '@/components/ui'

const fontSans = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
	weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
	title: 'Multi-Agent AI System',
	description: 'Advanced multi-agent AI system with intelligent routing',
	keywords: ['AI', 'Multi-Agent', 'GPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek'],
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className={fontSans.variable} suppressHydrationWarning>
			<body className='font-sans bg-background text-foreground min-h-screen antialiased'>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
					<div className='flex min-h-screen flex-col'>
						<NavigationHeader />
						<main className='flex-1'>{children}</main>
						<Toaster />
					</div>
				</ThemeProvider>
			</body>
		</html>
	)
}
