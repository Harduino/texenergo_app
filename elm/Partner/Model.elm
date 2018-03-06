module Partner.Model
    exposing
        ( Partner
        , PartnerId(..)
        , PartnerConfig
        , initPartnerConf
        , initPartner
        , partnerIdToString
        )


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


initPartner : Partner
initPartner =
    Partner (PartnerId "") ""


initPartnerConf : PartnerConfig
initPartnerConf =
    PartnerConfig "" [] False


partnerIdToString : PartnerId -> String
partnerIdToString (PartnerId str) =
    str
