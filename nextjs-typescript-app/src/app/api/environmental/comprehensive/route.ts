import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Call our Python backend for comprehensive environmental data
    const backendResponse = await fetch('http://localhost:5000/api/environmental/comprehensive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      })
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const comprehensiveData = await backendResponse.json();

    return NextResponse.json(comprehensiveData);
  } catch (error) {
    console.error('Error fetching comprehensive environmental data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch comprehensive environmental data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}