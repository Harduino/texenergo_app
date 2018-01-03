module Partner.Model exposing (Partner, PartnerConfig, partnerDecoder, initPartnerConf, initPartner)

import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)


type alias Partner =
  { id : String
  , name : String
  }


type alias PartnerConfig =
  { query : String 
  , partners : List Partner
  , editing : Bool
  }


initPartner : Partner
initPartner = Partner "" ""


initPartnerConf : PartnerConfig
initPartnerConf =
  PartnerConfig "" [] False


partnerDecoder : Decode.Decoder Partner
partnerDecoder =
  Decode.succeed Partner
    |> required "id" string
    |> required "name" string