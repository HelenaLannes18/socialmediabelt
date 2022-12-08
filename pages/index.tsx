
import Link from 'next/link'
import Seo from 'components/Seo'
import { signIn, signOut, useSession } from 'next-auth/react'
import { NextPage } from 'next'

const Home: NextPage = () => {
  const { data: session } = useSession()


  return (
    <><Seo title='Social Media Belt' description='Social Media Belt' /><><ul>
      <li><Link href='/app'>App</Link></li>
      <li><Link href='/devpleno'>Tenant devpleno</Link></li>
    </ul>
      <p>
        <button onClick={() => signIn('null', { callbackUrl: '/app' })}>Sign in</button>
      </p>
      <p>

        Signed in as {session?.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>

      </p>
    </></>


  )
}
export default Home