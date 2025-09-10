import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "../../../../../config/api";
import { DEFAULT_TIME_INTERVAL } from "./constants";
import { ActiveTab, buildApiParams, Data, FacilityOptions, LabType } from "./actions";

export default function MTBTRLSamplesByLab() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [data, setData] = useState<Data[]>([]);
  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ultra");
  const [labs, setLabs] = useState<FacilityOptions[]>([]);
  const [labType, setLabType] = useState<LabType>("All");
  const [disaggregation, setDisaggregation] = useState(false);

  useEffect(() => {
     fetchDataFromApi(
        timeInterval.startDate, 
        timeInterval.endDate, 
        disaggregation, 
        activeTab, 
        labs, 
        labType
      );
  }, [activeTab, timeInterval, disaggregation, labs, labType]);

  const fetchDataFromApi = async (
    startDate: string, 
    endDate: string, 
    disaggregation: boolean,
    activeTab: ActiveTab,
    labs: FacilityOptions[],
    labType: LabType
  ) => {
    const token = await getToken();
    const params = buildApiParams(timeInterval, activeTab, [], "All", false);
    const response = await api(token).get("/tb/gx/laboratories/trl_samples_by_lab_in_days/", {
      params: {
        ...params,
      },
    });
    setData(response.data);
    return response.data;
  };

  return (
    <div>
      <h1>MTB TRL Samples by Lab</h1>
    </div>
  );
}