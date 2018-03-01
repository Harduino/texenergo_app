module IncomingTransfer.Decoder
    exposing
        ( incomingTransferDecoder
        )

import IncomingTransfer.Model exposing (IncomingTransferId(..), IncomingTransfer)
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Utils.Date


incomingTransferDecoder : Decode.Decoder IncomingTransfer
incomingTransferDecoder =
    Decode.succeed IncomingTransfer
        |> required "id" (string |> Decode.map IncomingTransferId)
        |> required "date" Utils.Date.decoder
        |> required "number" string
        |> required "total" float
        |> required "partner_id" string
