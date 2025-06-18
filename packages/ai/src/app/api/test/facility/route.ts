import { NextRequest } from "next/server";

const tbData = [
  {
    "id": 1,
    "trace": 124,
    "mtb_detected": 435,
    "mtb_not_detected": 100,
    "invalid": 24,
    "no_result": 160,
    "errors": 10,
    "total": 853,
    "province": "Gaza",
    "district": "Xai-Xai",
    "year": 2024
  },
  {
    "id": 2,
    "trace": 130,
    "mtb_detected": 445,
    "mtb_not_detected": 105,
    "invalid": 22,
    "no_result": 155,
    "errors": 8,
    "total": 865,
    "province": "Gaza",
    "district": "Limpopo",
    "year": 2024
  },
  {
    "id": 3,
    "trace": 128,
    "mtb_detected": 440,
    "mtb_not_detected": 102,
    "invalid": 25,
    "no_result": 158,
    "errors": 9,
    "total": 862,
    "province": "Gaza",
    "district": "Chissano",
    "year": 2024
  },
  {
    "id": 4,
    "trace": 132,
    "mtb_detected": 450,
    "mtb_not_detected": 108,
    "invalid": 23,
    "no_result": 162,
    "errors": 7,
    "total": 882,
    "province": "Gaza",
    "district": "Chicualacuala",
    "year": 2024
  },
  {
    "id": 5,
    "trace": 135,
    "mtb_detected": 460,
    "mtb_not_detected": 110,
    "invalid": 26,
    "no_result": 165,
    "errors": 8,
    "total": 904,
    "province": "Gaza",
    "district": "Chigubo",
    "year": 2024
  },
  {
    "id": 6,
    "trace": 138,
    "mtb_detected": 470,
    "mtb_not_detected": 115,
    "invalid": 24,
    "no_result": 168,
    "errors": 9,
    "total": 924,
    "province": "Gaza",
    "district": "Chokwe",
    "year": 2024
  },
  {
    "id": 7,
    "trace": 140,
    "mtb_detected": 480,
    "mtb_not_detected": 120,
    "invalid": 25,
    "no_result": 170,
    "errors": 10,
    "total": 945,
    "province": "Gaza",
    "district": "Chongoene",
    "year": 2024
  },
  {
    "id": 8,
    "trace": 142,
    "mtb_detected": 490,
    "mtb_not_detected": 125,
    "invalid": 26,
    "no_result": 172,
    "errors": 11,
    "total": 966,
    "province": "Gaza",
    "district": "Mabalane",
    "year": 2024
  },
  {
    "id": 9,
    "trace": 145,
    "mtb_detected": 500,
    "mtb_not_detected": 130,
    "invalid": 27,
    "no_result": 175,
    "errors": 12,
    "total": 989,
    "province": "Gaza",
    "district": "Massangena",
    "year": 2024
  },
  {
    "id": 10,
    "trace": 148,
    "mtb_detected": 510,
    "mtb_not_detected": 135,
    "invalid": 28,
    "no_result": 178,
    "errors": 13,
    "total": 1012,
    "province": "Gaza",
    "district": "Massingir",
    "year": 2024
  },
];

// export async function GET(req: NextRequest) {
//   try {
//     // Get timeInterval from URL search params
//     const searchParams = req.nextUrl.searchParams;
//     const start = searchParams.get('start');
//     const end = searchParams.get('end');

//     if (!start || !end) {
//       return new Response(
//         JSON.stringify({ error: "Missing required query parameters: start and end" }), 
//         { status: 400 }
//       );
//     }

//     // Convert dates to Date objects for comparison
//     const startDate = new Date(start);
//     const endDate = new Date(end);

//     // Filter data based on the timeInterval
//     const filteredData = tbData.filter(item => {
//       const itemDate = new Date(`${item.year}-${getMonthNumber(item.month)}-01`);
//       return itemDate >= startDate && itemDate <= endDate;
//     });

//     // Create a resume of the data
//     const resume = `Total de registros: ${filteredData.length}. ` +
//       `Locais: ${filteredData.map(item => item.district).join(", ")}. ` +
//       `Total de casos MTB detectados: ${filteredData.reduce((sum, item) => sum + item.mtb_detected, 0)}. ` +
//       `Total de casos MTB não detectados: ${filteredData.reduce((sum, item) => sum + item.mtb_not_detected, 0)}. ` +
//       `Total de casos inválidos: ${filteredData.reduce((sum, item) => sum + item.invalid, 0)}. ` +
//       `Total de casos sem resultado: ${filteredData.reduce((sum, item) => sum + item.no_result, 0)}. ` +
//       `Total de erros: ${filteredData.reduce((sum, item) => sum + item.errors, 0)}.`;

//     return new Response(
//       JSON.stringify({ 
//         data: filteredData,
//         total: filteredData.length,
//         timeInterval: {
//           start: start,
//           end: end
//         },
//         resume: resume
//       }), 
//       { 
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
//   } catch (error) {
//     return new Response(
//       JSON.stringify({ 
//         error: "Internal server error",
//         message: error instanceof Error ? error.message : "Unknown error"
//       }), 
//       { status: 500 }
//     );
//   }
// }

// // Helper function to convert Portuguese month names to numbers
// function getMonthNumber(month: string): string {
//   const months: { [key: string]: string } = {
//     'Janeiro': '01',
//     'Fevereiro': '02',
//     'Março': '03',
//     'Abril': '04',
//     'Maio': '05',
//     'Junho': '06',
//     'Julho': '07',
//     'Agosto': '08',
//     'Setembro': '09',
//     'Outubro': '10',
//     'Novembro': '11',
//     'Dezembro': '12'
//   };
//   return months[month] || '01';
// }

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const districts = searchParams.get('districts')?.split(',');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Filter data based only on districts
    const filteredData = districts && districts.length > 0
      ? tbData.filter(item => districts.includes(item.district))
      : tbData;

    // Group data by district for the resume
    const districtSummary = filteredData.reduce((acc, item) => {
      if (!acc[item.district]) {
        acc[item.district] = {
          mtb_detected: 0,
          mtb_not_detected: 0,
          invalid: 0,
          no_result: 0,
          errors: 0,
          total: 0
        };
      }
      
      acc[item.district].mtb_detected += item.mtb_detected;
      acc[item.district].mtb_not_detected += item.mtb_not_detected;
      acc[item.district].invalid += item.invalid;
      acc[item.district].no_result += item.no_result;
      acc[item.district].errors += item.errors;
      acc[item.district].total += item.total;
      
      return acc;
    }, {} as Record<string, any>);

    // Create a detailed resume including district information
    const resume = `Total de registros: ${filteredData.length}. ` +
      Object.entries(districtSummary).map(([district, data]) => 
        `\n${district}: ` +
        `MTB detectados: ${data.mtb_detected}, ` +
        `MTB não detectados: ${data.mtb_not_detected}, ` +
        `Inválidos: ${data.invalid}, ` +
        `Sem resultado: ${data.no_result}, ` +
        `Erros: ${data.errors}, ` +
        `Total: ${data.total}`
      ).join('');

    return new Response(
      JSON.stringify({ 
        data: filteredData,
        total: filteredData.length,
        districts: districts || [],
        districtSummary,
        resume: resume
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    );
  }
}