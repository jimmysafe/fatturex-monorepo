export interface FteNotificationResponse {
  event: string;
  data: {
    notification: Notification;
  };
}

export interface Notification {
  uuid: string;
  invoice_uuid: string;
  created_at: Date;
  type: string;
  file_name: string;
  message: Message;
  downloaded: boolean;
}

export interface Message {
  identificativo_sdi: string;
  nome_file: string;
  data_ora_ricezione: Date;
  lista_errori: ListaErrori;
  message_id: string;
}

export interface ListaErrori {
  Errore: Errore[] | Errore;
}

export interface Errore {
  Codice: string;
  Descrizione: string;
  Suggerimento?: string;
}
