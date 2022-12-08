import '../styles/globals.css'
import type { AppProps } from 'next/app'
import LayoutApp from 'components/Layout/LayoutApp'
import { useRouter } from 'next/router'
import LayoutPublic from 'components/Layout/LayoutPublic'
import LayoutTenant from 'components/Layout/LayoutTenant'
import { SessionProvider } from 'next-auth/react'
import LayoutEmpty from 'components/Layout/LayoutEmpty'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {

  const router = useRouter()
  const { pathname } = router
  let Layout = LayoutPublic
  if (pathname.indexOf('/app') === 0) {
    Layout = LayoutApp
  }
  if (pathname.indexOf('/[slug]') === 0) {
    Layout = LayoutTenant
  }
  if (pathname === '/app') {
    Layout = LayoutEmpty
  }
  //pathname:
  //app
  //slug
  //...

  return (
    <SessionProvider session={session}>
      <Layout>
        {/* <pre>{JSON.stringify(pathname)}</pre> ver a rota */}
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
