import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      message: 'Auth API is working'
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // בסביבה אמיתית הייתה כאן בדיקה מול מסד נתונים
    // זו רק דוגמה בסיסית
    if (email && password && password.length >= 4) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'Authentication successful',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
} 