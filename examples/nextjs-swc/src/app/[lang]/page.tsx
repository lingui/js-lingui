import Link from "next/link";

export default function Index() {
  return (
    <>
      This is the homepage of the demo app. This page is not localized. You can
      go to the <Link href="/app-router-demo">App router demo</Link> or the{' '}
      <Link href="/pages-router-demo">Pages router demo</Link>.
    </>
  )
}
