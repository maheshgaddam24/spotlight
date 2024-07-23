

export interface GoldLayerTable {
    TABLE_NAME: string;
    ROW_COUNT: number;
    FILE_GENERATED_LINK: string | null;
    CREATED_AT: string;
    DB_TABLE_NAME: string,
    ELIMINATED_RECORDS: string,
    SOURCE_SYSTEM: string,
    ERROR_QUEUE_INFO: []
  }
  

export interface GoldLayerDataPreview{
        columns: string[];
        queryData: string[];
}


export interface projectDashboard {
    records: [];
    projectValue: [];
  }
  

export  interface pastFiveDagRuns {
    "x-axis": string[];
    row_count: number[];
    total_records: number;
    report_count: number;
  }
  
