module CustomerOrder.Model
    exposing
        ( CustomerOrder
        , CustomerOrderId(..)
        , CustomerOrderBrief
        , customerOrderBriefDecoder
        , customerOrdersDecoder
        , customerOrderDecoder
        , customerOrderIdToString
        )

import Date exposing (Date)
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Partner.Model exposing (Partner, PartnerId(..), PartnerConfig, initPartnerConf, initPartner)
import Partner.Decoder exposing (partnerDecoder)
import Utils.Date


type CustomerOrderId
    = CustomerOrderId String


type alias CustomerOrder =
    { id : String
    , number : String
    , total : Float
    , status : String
    , title : String
    , transportation : String
    , date : Date
    , partner : Partner
    , canEdit : Bool
    , canDestroy : Bool
    , amountPaid : Float
    }


type alias CustomerOrderBrief =
    { id : CustomerOrderId, number : String }


customerOrderIdToString : CustomerOrderId -> String
customerOrderIdToString (CustomerOrderId x) =
    x


customerOrderIdDecoder : Decode.Decoder CustomerOrderId
customerOrderIdDecoder =
    string |> Decode.map CustomerOrderId


customerOrderBriefDecoder : Decode.Decoder CustomerOrderBrief
customerOrderBriefDecoder =
    Decode.succeed CustomerOrderBrief
        |> required "id" customerOrderIdDecoder
        |> required "number" string


customerOrdersDecoder : Decode.Decoder (List CustomerOrder)
customerOrdersDecoder =
    Decode.list customerOrderDecoder


customerOrderDecoder : Decode.Decoder CustomerOrder
customerOrderDecoder =
    Decode.succeed CustomerOrder
        |> required "id" string
        |> required "number" string
        |> required "total" float
        |> required "status" string
        |> required "title" string
        |> required "transportation" string
        |> required "date" Utils.Date.decoder
        |> required "partner" partnerDecoder
        |> required "can_edit" bool
        |> required "can_destroy" bool
        |> required "amount_paid" float
