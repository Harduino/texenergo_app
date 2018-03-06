module Partner.Decoder
    exposing
        ( partnerDecoder
        )

import Partner.Model exposing (PartnerId(..), Partner)
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)


partnerDecoder : Decode.Decoder Partner
partnerDecoder =
    Decode.succeed Partner
        |> required "id" (string |> Decode.map PartnerId)
        |> required "name" string
