module Partner.Model
    exposing
        ( Partner
        , PartnerId(..)
        , PartnerConfig
        , partnerDecoder
        , initPartnerConf
        , initPartner
        , partnerIdToString
        )

import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)


type PartnerId
    = PartnerId String


type alias Partner =
    { id : PartnerId
    , name : String
    }


type alias PartnerConfig =
    { query : String
    , partners : List Partner
    , editing : Bool
    }


partnerIdToString : PartnerId -> String
partnerIdToString (PartnerId str) =
    str


initPartner : Partner
initPartner =
    Partner (PartnerId "") ""


initPartnerConf : PartnerConfig
initPartnerConf =
    PartnerConfig "" [] False


partnerDecoder : Decode.Decoder Partner
partnerDecoder =
    Decode.succeed Partner
        |> required "id" (string |> Decode.map PartnerId)
        |> required "name" string
