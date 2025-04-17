
interface GetFacilitiesDataFromApiProps {
  endpoint: string;
  timeInterval: { startDate: string, endDate: string };
  type: "province" | "district" | "clinic";
  facilities?: string[];
}

interface GetLabsDataFromApiProps {
  endpoint: string;
  timeInterval: { startDate: string, endDate: string };
  labs?: string[];
  type?: "conventional" | "poc" | "all";
}

export async function getFacilitiesDataFromApi ({
  endpoint,
  timeInterval,
  type,
  facilities,
}: GetFacilitiesDataFromApiProps) {
  try {
    // Create URL with base path
    const url = new URL(endpoint);
    
    // Add dates as separate array elements in query string
    url.searchParams.append('dates[]', timeInterval.startDate);
    url.searchParams.append('dates[]', timeInterval.endDate);
    
    // Add facility codes if present
    if (facilities && facilities?.length > 0) {
      facilities?.forEach(code => {
        url.searchParams.append('codes[]', code);
      });
    }

    // Add facility type
    if (type) {
      url.searchParams.append('type', type);
    }

    console.log("URL: ", url.toString());

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
}

export async function getLabsDataFromApi ({
  endpoint,
  timeInterval,
  type,
  labs,
}: GetLabsDataFromApiProps) {
  try {
    // Create URL with base path
    const url = new URL(endpoint);
    
    // Add dates as separate array elements in query string
    url.searchParams.append('dates[]', timeInterval.startDate);
    url.searchParams.append('dates[]', timeInterval.endDate);
    
    // Add facility codes if present
    if (labs && labs?.length > 0) {
      labs?.forEach(code => {
        url.searchParams.append('codes[]', code);
      });
    }

    // Add facility type
    if (type) {
      url.searchParams.append('type', type);
    }

    console.log("URL: ", url.toString());

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
}