module Contact.Decoder
    exposing
        ( contactDecoder
        , contactIdToString
        )

import Contact.Model exposing (ContactId(..), Contact)
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)


contactIdToString : ContactId -> String
contactIdToString (ContactId str) =
    str


contactDecoder : Decode.Decoder Contact
contactDecoder =
    Decode.succeed Contact
        |> required "id" (string |> Decode.map ContactId)
        |> required "email" string
        |> required "first_name" string
        |> required "last_name" string
        |> required "partner_id" string
        |> required "role" string
