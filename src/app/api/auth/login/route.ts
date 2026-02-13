import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      detail: 'Email/password login is disabled. Use Zendesk authentication.'
    },
    { status: 403 }
  )
}
