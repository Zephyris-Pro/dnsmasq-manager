import { defineConfig, type DefaultTheme } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	base: '/dnsmasq-manager/',
	title: "DNSMasq Manager",
	description: "Easily manage your custom DNS records",
	head: [
		["link", { rel: "icon", href: "/dnsmasq-manager/icon.png" }],
		["meta", { name: "description", content: "Modern web interface to manage DNSMasq. Create and manage your DNS records (A, AAAA, CNAME, TXT) without manually editing configuration files." }],
		["meta", { property: "og:title", content: "DNSMasq Manager" }],
		["meta", { property: "og:description", content: "Modern web interface to manage DNSMasq with authentication, dark/light theme and multilingual support"}],
		["meta", { property: "og:type", content: "website" }],
		["meta", { name: "keywords", content: "dnsmasq, dns, manager, docker, web interface, dns records" }],
	],
	ignoreDeadLinks: [
		/localhost/,
	],
	metaChunk: true,
	srcDir: './src',
	outDir: './dist',
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		logo: { src: '/logo.png', width: 24, height: 24 },
		nav: [
			{ text: 'Setup', link: '/setup/' },
		],
		sidebar: [
			{
				items: [
					// { text: 'Home', link: '/' },
					{ text: 'Guide', link: '/guide/' },
					{ text: 'Screenshots', link: '/screenshots/' },
					{ text: 'Setup Instructions', link: '/setup/' },
					{ text: 'Advanced Configuration', link: '/advanced-config/' },
					{ text: 'Upgrading', link: '/upgrading/' },
					{ text: 'Frequently Asked Questions', link: '/faq/' },
					{ text: 'Third Party', link: '/third-party/' },
					{ text: 'Todo', link: '/todo/' },
				]
			}
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/Zephyris-Pro/dnsmasq-manager' }
		],
		search: {
			provider: 'local'
		},
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2026-present DNSMasq Manager Contributors'
		}
	}
});
