"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "@repo/design_system/app/atoms/inputs/Button";
import { Dialog } from "@repo/design_system/app/atoms/modals/Dialog";
import { reportActionIcons } from "./reportActionIcons";
import type { ReportFeedbackPayload, ReportFeedbackType, ReportModuleId } from "./types";

const feedbackTypes: ReportFeedbackType[] = ["Dúvida", "Sugestão", "Problema nos dados", "Problema visual"];

type ReportFeedbackDialogProps = {
  cardId: string;
  cardTitle: string;
  currentPage?: string;
  module: ReportModuleId;
  onClose: () => void;
  open: boolean;
  user?: {
    email?: string;
    name?: string;
  };
};

export function ReportFeedbackDialog({ cardId, cardTitle, currentPage, module, onClose, open, user }: ReportFeedbackDialogProps) {
  const [type, setType] = useState<ReportFeedbackType>("Dúvida");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const payload = useMemo<ReportFeedbackPayload>(
    () => ({
      cardId,
      cardTitle,
      createdAt: new Date().toISOString(),
      currentPage,
      message,
      module,
      type,
      user: user?.email || user?.name ? user : undefined,
    }),
    [cardId, cardTitle, currentPage, message, module, type, user],
  );

  const handleSubmit = async () => {
    if (!message.trim()) {
      setStatus("Escreva uma mensagem antes de enviar a sugestão.");
      return;
    }

    const serialized = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard?.writeText(serialized);
      setStatus("Funcionalidade preparada para integração. Payload copiado para a área de transferência.");
    } catch {
      setStatus("Funcionalidade preparada para integração. O payload está pronto para futura integração.");
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack alignItems="center" direction="row" spacing={1}>
          {reportActionIcons.feedback}
          <Typography component="span" fontSize={20} fontWeight={850}>
            Dúvidas e sugestões
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {status ? <Alert severity={message.trim() ? "info" : "warning"}>{status}</Alert> : null}
          <FormControl fullWidth>
            <InputLabel id={`${cardId}-feedback-type-label`}>Tipo</InputLabel>
            <Select
              label="Tipo"
              labelId={`${cardId}-feedback-type-label`}
              onChange={(event) => setType(event.target.value as ReportFeedbackType)}
              value={type}
            >
              {feedbackTypes.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Mensagem"
            minRows={5}
            multiline
            onChange={(event) => setMessage(event.target.value)}
            value={message}
          />
          <Typography color="text.secondary" fontSize={12.5}>
            Este formulário não envia dados para o backend nesta fase e não deve incluir dados de pacientes.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={reportActionIcons.close} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} startIcon={reportActionIcons.apply} variant="contained">
          Enviar sugestão
        </Button>
      </DialogActions>
    </Dialog>
  );
}
