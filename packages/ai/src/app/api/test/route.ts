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
    "month": "Janeiro",
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
    "month": "Fevereiro",
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
    "month": "Março",
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
    "month": "Abril",
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
    "month": "Maio",
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
    "month": "Junho",
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
    "month": "Julho",
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
    "month": "Agosto",
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
    "month": "Setembro",
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
    "month": "Outubro",
    "year": 2024
  },
  {
    "id": 11,
    "trace": 150,
    "mtb_detected": 520,
    "mtb_not_detected": 140,
    "invalid": 29,
    "no_result": 180,
    "errors": 14,
    "total": 1033,
    "month": "Novembro",
    "year": 2024
  },
  {
    "id": 12,
    "trace": 152,
    "mtb_detected": 530,
    "mtb_not_detected": 145,
    "invalid": 30,
    "no_result": 182,
    "errors": 15,
    "total": 1054,
    "month": "Dezembro",
    "year": 2024
  },
  {
    "id": 13,
    "trace": 155,
    "mtb_detected": 540,
    "mtb_not_detected": 150,
    "invalid": 31,
    "no_result": 185,
    "errors": 16,
    "total": 1077,
    "month": "Janeiro",
    "year": 2025
  },
  {
    "id": 14,
    "trace": 158,
    "mtb_detected": 550,
    "mtb_not_detected": 155,
    "invalid": 32,
    "no_result": 188,
    "errors": 17,
    "total": 1100,
    "month": "Fevereiro",
    "year": 2025
  },
  {
    "id": 15,
    "trace": 160,
    "mtb_detected": 560,
    "mtb_not_detected": 160,
    "invalid": 33,
    "no_result": 190,
    "errors": 18,
    "total": 1121,
    "month": "Março",
    "year": 2025
  },
  {
    "id": 16,
    "trace": 162,
    "mtb_detected": 570,
    "mtb_not_detected": 165,
    "invalid": 34,
    "no_result": 192,
    "errors": 19,
    "total": 1142,
    "month": "Abril",
    "year": 2025
  },
  {
    "id": 17,
    "trace": 165,
    "mtb_detected": 580,
    "mtb_not_detected": 170,
    "invalid": 35,
    "no_result": 195,
    "errors": 20,
    "total": 1165,
    "month": "Maio",
    "year": 2025
  }
];

export async function GET(req: NextRequest) {
  try {
    // Get timeInterval from URL search params
    const searchParams = req.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return new Response(
        JSON.stringify({ error: "Missing required query parameters: start and end" }), 
        { status: 400 }
      );
    }

    // Convert dates to Date objects for comparison
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Filter data based on the timeInterval
    const filteredData = tbData.filter(item => {
      const itemDate = new Date(`${item.year}-${getMonthNumber(item.month)}-01`);
      return itemDate >= startDate && itemDate <= endDate;
    });

    // Create a resume of the data
    const resume = `Total de registros: ${filteredData.length}. ` +
      `Período: ${filteredData[0]?.month} ${filteredData[0]?.year} até ${filteredData[filteredData.length - 1]?.month} ${filteredData[filteredData.length - 1]?.year}. ` +
      `Total de casos MTB detectados: ${filteredData.reduce((sum, item) => sum + item.mtb_detected, 0)}. ` +
      `Total de casos MTB não detectados: ${filteredData.reduce((sum, item) => sum + item.mtb_not_detected, 0)}. ` +
      `Total de casos inválidos: ${filteredData.reduce((sum, item) => sum + item.invalid, 0)}. ` +
      `Total de casos sem resultado: ${filteredData.reduce((sum, item) => sum + item.no_result, 0)}. ` +
      `Total de erros: ${filteredData.reduce((sum, item) => sum + item.errors, 0)}.`;

    return new Response(
      JSON.stringify({ 
        data: filteredData,
        total: filteredData.length,
        timeInterval: {
          start: start,
          end: end
        },
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

// Helper function to convert Portuguese month names to numbers
function getMonthNumber(month: string): string {
  const months: { [key: string]: string } = {
    'Janeiro': '01',
    'Fevereiro': '02',
    'Março': '03',
    'Abril': '04',
    'Maio': '05',
    'Junho': '06',
    'Julho': '07',
    'Agosto': '08',
    'Setembro': '09',
    'Outubro': '10',
    'Novembro': '11',
    'Dezembro': '12'
  };
  return months[month] || '01';
}