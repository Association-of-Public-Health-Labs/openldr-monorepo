
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"

import { CalendarIcon } from "lucide-react"
import {
  Button as ButtonARIA,
  DateRangePicker,
  Dialog as DialogARIA,
  Group,
  I18nProvider,
  // Label,
  Popover as PopoverARIA,
} from "react-aria-components"

import { cn } from "../../../lib/utils"
import { RangeCalendar } from "../../../components/ui/calendar-rac"
import { DateInput, dateInputStyle } from "../../../components/ui/datefield-rac"

import { Label } from "../../../components/ui/label"
import MultipleSelector, { Option } from "../../../components/ui/multiselect"
import { Button } from "../../../components/ui/button"

import { useId, useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { getLocalTimeZone, toCalendarDate } from "@internationalized/date"

const labs = [
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Mossuril",
    "LabCode": "179",
    "LabName": "CS Mossuril"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Matola",
    "LabCode": "064",
    "LabName": "CS Machava II"
  },
  {
    "ProvinceName": "Tete",
    "DistrictName": "Cahora Bassa",
    "LabCode": "154",
    "LabName": "CS Songo"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Milange",
    "LabCode": "150",
    "LabName": "HD Milange"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "209",
    "LabName": "CS Chicualacuala,Gaza Chicuala"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Kamaxakeni",
    "LabCode": "002",
    "LabName": "CS 1 De Maio(Maputo)"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Marracuene",
    "LabCode": "129",
    "LabName": "CS Marracuene"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Cidade de Nampula",
    "LabCode": "021",
    "LabName": "CS 25 De Setembro(Nampula)"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Cidade de Nampula",
    "LabCode": "PNC",
    "LabName": "Nampula"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Districto de Nampula",
    "LabCode": "110",
    "LabName": "HG Marrere"
  },
  {
    "ProvinceName": "Niassa",
    "DistrictName": "Cuamba",
    "LabCode": "039",
    "LabName": "HD Cuamba"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Pebane",
    "LabCode": "014",
    "LabName": "CS Pebane-Sede"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "204",
    "LabName": "CS Maringue-Sede,Sofala Maring"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "PCI",
    "LabName": "HD de Caia"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "PPC",
    "LabName": "Laboratorio Polana Canico ph:8"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Chockwe",
    "LabCode": "116",
    "LabName": "CS Chalucuane"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Limpopo",
    "LabCode": "089",
    "LabName": "CS Chissano"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Mabalane",
    "LabCode": "118",
    "LabName": "CS Mabalane"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Nacala Porto",
    "LabCode": "148",
    "LabName": "HD Nacala Porto"
  },
  {
    "ProvinceName": "Niassa",
    "DistrictName": "Cidade de Lichinga",
    "LabCode": "PLC",
    "LabName": "HP Lichinga"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Caia",
    "LabCode": "009",
    "LabName": "HD Caia"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Mocuba",
    "LabCode": "016",
    "LabName": "CS Mocuba"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Molumbo",
    "LabCode": "191",
    "LabName": "CS Molumbo"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Bilene",
    "LabCode": "005",
    "LabName": "CS Macia"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Mocubela",
    "LabCode": "056",
    "LabName": "CS Mocubela"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Namacurra",
    "LabCode": "030",
    "LabName": "CS Namacurra-Sede"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Chokwe",
    "LabCode": "PCA",
    "LabName": "Carmelo"
  },
  {
    "ProvinceName": "Inhambane",
    "DistrictName": "Inhassoro",
    "LabCode": "073",
    "LabName": "CS Inhassoro"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Barue",
    "LabCode": "142",
    "LabName": "HD Catandica"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Guro",
    "LabCode": "168",
    "LabName": "CS Guro-Sede"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Vanduzi",
    "LabCode": "141",
    "LabName": "CS Vanduzi"
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Mecufi",
    "LabCode": "158",
    "LabName": "CS Mecufi"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Gondola",
    "LabCode": "026",
    "LabName": "HD Gondola"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Kamavota",
    "LabCode": "004",
    "LabName": "CS Mavalane"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Khampfumo",
    "LabCode": "113",
    "LabName": "CS Alto Mae"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Beira",
    "LabCode": "007",
    "LabName": "CS Munhava"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Matola",
    "LabCode": "PPM",
    "LabName": "HP Matola"
  },
  {
    "ProvinceName": "Tete",
    "DistrictName": "Maravia",
    "LabCode": null,
    "LabName": "CS Massinga"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Ile",
    "LabCode": "017",
    "LabName": "CS ILE-Sede"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "000",
    "LabName": null
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Pemba",
    "LabCode": "029",
    "LabName": "CS Natite"
  },
  {
    "ProvinceName": "Inhambane",
    "DistrictName": "Maxixe",
    "LabCode": "061",
    "LabName": "CS Maxixe"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Matola",
    "LabCode": "133",
    "LabName": "CS Ndlavela"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Angoche",
    "LabCode": "032",
    "LabName": "HR Angoche"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Cidade de Nampula",
    "LabCode": "PNT",
    "LabName": "Nampula"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Guile",
    "LabCode": "096",
    "LabName": "HD Gile"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "PPI",
    "LabName": "Inhambane"
  },
  {
    "ProvinceName": "Inhambane",
    "DistrictName": "Zavala",
    "LabCode": "123",
    "LabName": "HD Quissico"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Macate",
    "LabCode": "169",
    "LabName": "CS Macate"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Mecuburi",
    "LabCode": "051",
    "LabName": "CS Mecuburi"
  },
  {
    "ProvinceName": "Tete",
    "DistrictName": "Tete",
    "LabCode": "PTC",
    "LabName": "PTC HP Tete"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Lugela",
    "LabCode": "060",
    "LabName": "CS Lugela-Sede(Lugela)"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Guija",
    "LabCode": "086",
    "LabName": "CS Guija"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "KaMpfumu",
    "LabCode": "PDM",
    "LabName": "Dream Maputo"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Khampfumo",
    "LabCode": "063",
    "LabName": "HC Maputo"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Matola",
    "LabCode": "132",
    "LabName": "CS Matola II"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Alto Molocue",
    "LabCode": "095",
    "LabName": "HR Alto Mulocue"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "205",
    "LabName": "CS Chemba-Sede,Sofala Chemba"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "PMH",
    "LabName": "Laboratorio Distrito da Manhica "
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Balama",
    "LabCode": "157",
    "LabName": "CS Balama"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Milange",
    "LabCode": "099",
    "LabName": "CS Milange"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Quelimane",
    "LabCode": "055",
    "LabName": "CS Maquival Sede"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Kamavota",
    "LabCode": "PMA",
    "LabName": "HG Mavalane"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Matola",
    "LabCode": "PMT",
    "LabName": "HG Machava"
  },
  {
    "ProvinceName": "Tete",
    "DistrictName": "Cahora Bassa",
    "LabCode": "188",
    "LabName": "CS Chitima"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Inhassunge",
    "LabCode": "059",
    "LabName": "CS Inhassunge-Sede"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Mocuba",
    "LabCode": "149",
    "LabName": "HD Mocuba"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "201",
    "LabName": "CS Massangena,Gaza Massangena"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "215",
    "LabName": null
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Namuno",
    "LabCode": "081",
    "LabName": "CS Namuno"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Kamubukwane",
    "LabCode": "001",
    "LabName": "CS Bagamoio"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Matola",
    "LabCode": null,
    "LabName": "CS Nkobe"
  },
  {
    "ProvinceName": "Niassa",
    "DistrictName": "Metarica",
    "LabCode": "183",
    "LabName": "CS Metarica"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "PCH",
    "LabName": "Chamancolo Laboratorio"
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Mueda",
    "LabCode": "028",
    "LabName": "HR Mueda"
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Pemba",
    "LabCode": "070",
    "LabName": "HP Pemba"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Limpopo",
    "LabCode": "035",
    "LabName": "CS Chicumbane"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Nlhamankulu",
    "LabCode": "PJT",
    "LabName": "Jose Macamo"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Manhica",
    "LabCode": "128",
    "LabName": "CS Xinavane"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Nhamatanda",
    "LabCode": "011",
    "LabName": "HR Nhamatanda"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Morrumbala",
    "LabCode": "101",
    "LabName": "CS Morrumbala"
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Metuge",
    "LabCode": "159",
    "LabName": "CS Metuge"
  },
  {
    "ProvinceName": "Inhambane",
    "DistrictName": "Jangamo",
    "LabCode": "164",
    "LabName": "CS Jangamo"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Maganja da Costa",
    "LabCode": "031",
    "LabName": "CS Maganja da Costa"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Xai-Xai",
    "LabCode": "088",
    "LabName": "PS Marien Nguabi"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Chimoio",
    "LabCode": "037",
    "LabName": "CS Eduardo Mondlane(Chimoio)"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Kamavota",
    "LabCode": "111",
    "LabName": "CS 1 de Junho"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "KaMpfumu",
    "LabCode": "PIT",
    "LabName": "HM Maputo"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Buzi",
    "LabCode": "075",
    "LabName": "HR Buzi"
  },
  {
    "ProvinceName": "Tete",
    "DistrictName": "Tete",
    "LabCode": "PTT",
    "LabName": "PTT INS"
  },
  {
    "ProvinceName": "Inhambane",
    "DistrictName": "Morrumbene",
    "LabCode": "071",
    "LabName": "CS Morrumbene"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "KaMpfumu",
    "LabCode": "PTB",
    "LabName": "PTB INS"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Namaacha",
    "LabCode": "175",
    "LabName": "CS Namaacha"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Moma",
    "LabCode": "019",
    "LabName": "HD Moma"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Beira",
    "LabCode": "135",
    "LabName": "CS Macurrungo"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Gurue",
    "LabCode": "097",
    "LabName": "HD Gurue"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "214",
    "LabName": null
  },
  {
    "ProvinceName": "Inhambane",
    "DistrictName": "Inhambane",
    "LabCode": "163",
    "LabName": "CS Balane(Urbano)"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "KaMpfumu",
    "LabCode": "PIC",
    "LabName": "HM Maputo"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Meconta",
    "LabCode": "020",
    "LabName": "CS Namialo"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Mogovolas",
    "LabCode": "022",
    "LabName": "CS Nametil"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Beira",
    "LabCode": "186",
    "LabName": "CS Militar de Matacuane"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Quelimane",
    "LabCode": "PQA",
    "LabName": "Lab.Clinic-Quelimane"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Quelimane",
    "LabCode": "PQC",
    "LabName": "Quelimane"
  },
  {
    "ProvinceName": null,
    "DistrictName": null,
    "LabCode": "PBT",
    "LabName": "TB LABORATORIO de REF da BEIRA"
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Montepuez",
    "LabCode": "045",
    "LabName": "HR Montepuez"
  },
  {
    "ProvinceName": "Inhambane",
    "DistrictName": "Mabote",
    "LabCode": "165",
    "LabName": "CS Mabote"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Manica",
    "LabCode": "041",
    "LabName": "CS Manica"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Chimoio",
    "LabCode": "PCM",
    "LabName": "Chimoio"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Nlhamankulu",
    "LabCode": "PJC",
    "LabName": "Jose Macamo"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Malema",
    "LabCode": "050",
    "LabName": "CS Malema"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Beira",
    "LabCode": "PPG",
    "LabName": "Ponta Gea"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Dondo",
    "LabCode": "010",
    "LabName": "CS Dondo"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Mopeia",
    "LabCode": "015",
    "LabName": "CS Mopeia-Sede"
  },
  {
    "ProvinceName": "Cabo Delgado",
    "DistrictName": "Ancuabe",
    "LabCode": "080",
    "LabName": "CS Ancuabe"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Chibuto",
    "LabCode": "114",
    "LabName": "CS Malehice"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Chongoene",
    "LabCode": "084",
    "LabName": "CS Chongoene"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Cidade de Nampula",
    "LabCode": "033",
    "LabName": "CS Muhala-Expansao"
  },
  {
    "ProvinceName": "Niassa",
    "DistrictName": "Ngauma",
    "LabCode": "184",
    "LabName": "CS Massangulo"
  },
  {
    "ProvinceName": "Tete",
    "DistrictName": "Changara",
    "LabCode": "092",
    "LabName": "CS Changara"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Quelimane",
    "LabCode": "PQM",
    "LabName": "Quelimane"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Xai-Xai",
    "LabCode": "PXA",
    "LabName": "XAI-XAI"
  },
  {
    "ProvinceName": "Maputo Cidade",
    "DistrictName": "Kamavota",
    "LabCode": "112",
    "LabName": "CS Albazine"
  },
  {
    "ProvinceName": "Niassa",
    "DistrictName": "Mecanhelas",
    "LabCode": "094",
    "LabName": "CS Mecanhelas"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Beira",
    "LabCode": "185",
    "LabName": "CS Inhamizua"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Derre",
    "LabCode": "058",
    "LabName": "CS Derre"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Chibuto",
    "LabCode": "115",
    "LabName": "CS Chibuto"
  },
  {
    "ProvinceName": "Gaza",
    "DistrictName": "Xai-Xai",
    "LabCode": "034",
    "LabName": "CS Xai-Xai"
  },
  {
    "ProvinceName": "Manica",
    "DistrictName": "Mossurize",
    "LabCode": "151",
    "LabName": "HD Espungabera"
  },
  {
    "ProvinceName": "Maputo Provincia",
    "DistrictName": "Boane",
    "LabCode": "003",
    "LabName": "CS Boane"
  },
  {
    "ProvinceName": "Nampula",
    "DistrictName": "Erati",
    "LabCode": "108",
    "LabName": "HR Namapa"
  },
  {
    "ProvinceName": "Sofala",
    "DistrictName": "Beira",
    "LabCode": "068",
    "LabName": "CS Ponta Gea"
  },
  {
    "ProvinceName": "Zambezia",
    "DistrictName": "Nicoadala",
    "LabCode": "018",
    "LabName": "CS Nicoadala-Sede"
  }
]

type OnApplyParams = {
  date: DateRange
  selectedLabs: {
    province?: string
    district?: string
    lab?: string
    labCode?: string
  }[]
}

export type LabDialogProps = {
  onCancel: () => void
  onApply: (params: OnApplyParams) => void
  open: boolean
  setOpen: (open: boolean) => void
}

export function LabDialog({onCancel, onApply, open, setOpen}: LabDialogProps) {
  const id = useId()
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedProvinces, setSelectedProvinces] = useState<Option[]>([])
  const [selectedDistricts, setSelectedDistricts] = useState<Option[]>([])
  const [selectedLabs, setSelectedLabs] = useState<Option[]>([])

  // Convert AriaDateRange to DateRange format for onApply
  const convertToDateRange = (ariaRange: any): DateRange | undefined => {
    if (!ariaRange || !ariaRange.start || !ariaRange.end) {
      return undefined
    }
    // Convert CalendarDate to native Date
    const startDate = ariaRange.start.toDate ? ariaRange.start.toDate(getLocalTimeZone()) : new Date(ariaRange.start.year, ariaRange.start.month - 1, ariaRange.start.day)
    const endDate = ariaRange.end.toDate ? ariaRange.end.toDate(getLocalTimeZone()) : new Date(ariaRange.end.year, ariaRange.end.month - 1, ariaRange.end.day)
    return {
      from: startDate,
      to: endDate
    }
  }

  // Filter districts based on selected provinces
  const filteredDistricts = selectedProvinces.length > 0
    ? Array.from(new Set(
        labs
          .filter(lab => 
            lab.ProvinceName != null && 
            selectedProvinces.some(prov => prov.value === lab.ProvinceName)
          )
          .map(lab => lab.DistrictName)
          .filter((districtName): districtName is string => districtName != null)
      )).map(districtName => ({
        value: districtName,
        label: districtName
      }))
    : Array.from(new Set(
        labs
          .map(lab => lab.DistrictName)
          .filter((districtName): districtName is string => districtName != null)
      )).map(districtName => ({
        value: districtName,
        label: districtName
      }))

  // Filter labs based on selected provinces and districts
  const filteredLabs = labs
    .filter(lab => {
      // Ensure lab object and required fields exist
      if (!lab || lab.LabCode == null || lab.LabName == null) {
        return false
      }
      const matchesProvince = selectedProvinces.length === 0 || 
        (lab.ProvinceName != null && selectedProvinces.some(prov => prov.value === lab.ProvinceName))
      const matchesDistrict = selectedDistricts.length === 0 || 
        (lab.DistrictName != null && selectedDistricts.some(dist => dist.value === lab.DistrictName))
      return matchesProvince && matchesDistrict
    })
    .map(lab => ({
      value: lab.LabCode!,
      label: lab.LabName!
    }))

  // Handle province selection change
  const handleProvinceChange = (provinces: Option[]) => {
    setSelectedProvinces(provinces)
    // Filter out districts that are no longer valid based on selected provinces
    if (provinces.length > 0) {
      const validDistrictValues = new Set(
        labs
          .filter(lab => 
            lab.ProvinceName != null && 
            provinces.some(prov => prov.value === lab.ProvinceName)
          )
          .map(lab => lab.DistrictName)
          .filter((districtName): districtName is string => districtName != null)
      )
      setSelectedDistricts(prev => 
        prev.filter(dist => validDistrictValues.has(dist.value))
      )
    } else {
      setSelectedDistricts([])
    }
    // Clear labs when provinces change
    setSelectedLabs([])
  }

  // Handle district selection change
  const handleDistrictChange = (districts: Option[]) => {
    setSelectedDistricts(districts)
    // Labs will be filtered by useEffect when districts change
  }

  // Update labs when districts or provinces change
  useEffect(() => {
    const validLabCodes = new Set(
      labs
        .filter(lab => {
          // Ensure lab object and LabCode exist
          if (!lab || lab.LabCode == null) {
            return false
          }
          const matchesProvince = selectedProvinces.length === 0 || 
            (lab.ProvinceName != null && selectedProvinces.some(prov => prov.value === lab.ProvinceName))
          const matchesDistrict = selectedDistricts.length === 0 || 
            (lab.DistrictName != null && selectedDistricts.some(dist => dist.value === lab.DistrictName))
          return matchesProvince && matchesDistrict
        })
        .map(lab => lab.LabCode!)
        .filter((labCode): labCode is string => labCode != null)
    )
    setSelectedLabs(prev => 
      prev.filter(lab => validLabCodes.has(lab.value))
    )
  }, [selectedProvinces, selectedDistricts])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger>Open</DialogTrigger> */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pesquisar por Laboratório</DialogTitle>
          <DialogDescription>
            Pesquise por Provincia e Distrito para selecionar o Laboratório desejado.
          </DialogDescription>
        </DialogHeader>

        <div className="*:not-first:mt-2">
          <Label className="font-semibold">Provincia onde localiza-se o Laboratório</Label>
          <MultipleSelector
            commandProps={{
              label: "Selecionar Provincia",
              shouldFilter: true
            }}
            value={selectedProvinces}
            onChange={handleProvinceChange}
            defaultOptions={Array.from(new Set(
              labs
                .map(lab => lab.ProvinceName)
                .filter((provinceName): provinceName is string => provinceName != null)
            )).map(provinceName => ({
              value: provinceName,
              label: provinceName
            }))}
            placeholder="Selecionar Provincia"
            hidePlaceholderWhenSelected
            emptyIndicator={<p className="text-center text-sm">Nenhuma Província encontrada</p>}
          />
        </div>
        <div className="*:not-first:mt-2">
          <Label className="font-semibold">Distrito onde localiza-se o Laboratório</Label>
          <MultipleSelector
            commandProps={{
              label: "Selecionar Distrito",
              shouldFilter: true
            }}
            value={selectedDistricts}
            onChange={handleDistrictChange}
            options={filteredDistricts}
            placeholder="Selecionar Distrito"
            hidePlaceholderWhenSelected
            emptyIndicator={<p className="text-center text-sm">Nenhuma Distrito encontrado</p>}
          />
        </div>
        <div className="*:not-first:mt-2">
          <Label className="font-semibold">Laboratório</Label>
          <MultipleSelector
            commandProps={{
              label: "Selecionar Laboratório",
              shouldFilter: true
            }}
            value={selectedLabs}
            onChange={setSelectedLabs}
            options={filteredLabs.filter(lab => lab.value != null && lab.label != null)}
            placeholder="Selecionar Laboratório"
            hidePlaceholderWhenSelected
            emptyIndicator={<p className="text-center text-sm">Nenhum Laboratório encontrado</p>}
            hideClearAllButton={false}
          />
        </div>

        <I18nProvider locale="pt-PT">
          <DateRangePicker 
            className="*:not-first:mt-2"
            value={dateRange}
            onChange={setDateRange}
          >
            <Label  className="font-semibold">Intervalo de datas</Label>
            <div className="flex">
              <Group className={cn(dateInputStyle, "pe-9")}>
                <DateInput slot="start" unstyled />
                <span aria-hidden="true" className="px-2 text-muted-foreground/70">
                  -
                </span>
                <DateInput slot="end" unstyled />
              </Group>
              <ButtonARIA
                slot="trigger"
                className="z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-[3px] data-focus-visible:ring-ring/50"
                aria-label="Abrir calendário"
              >
                <CalendarIcon size={16} />
              </ButtonARIA>
            </div>
            <PopoverARIA
              UNSTABLE_portalContainer={
                typeof document !== "undefined" ? document.body : undefined
              }
              className="z-50 rounded-md border bg-background text-popover-foreground shadow-lg outline-hidden data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
              offset={4}
            >
              <DialogARIA className="max-h-[inherit] overflow-auto p-2">
                <RangeCalendar value={dateRange} onChange={setDateRange} />
              </DialogARIA>
            </PopoverARIA>
          </DateRangePicker>
        </I18nProvider>

        <DialogFooter>
          <Button className="font-semibold" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button 
            className="font-semibold"
            onClick={() => {
              const mappedLabs = selectedLabs
                .filter(labOption => labOption.value != null)
                .map(labOption => {
                  const labData = labs.find(lab => lab && lab.LabCode === labOption.value)
                  return {
                    province: labData?.ProvinceName ?? undefined,
                    district: labData?.DistrictName ?? undefined,
                    lab: labData?.LabName ?? labOption.label,
                    labCode: labOption.value
                  }
                })
              const convertedDate = convertToDateRange(dateRange)
              onApply({
                date: convertedDate ?? { from: undefined, to: undefined },
                selectedLabs: mappedLabs
              })
            }}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
  )
}
