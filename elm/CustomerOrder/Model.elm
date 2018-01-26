module CustomerOrder.Model exposing (CustomerOrderId, CustomerOrderBrief, customerOrderBriefDecoder)

import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)


type CustomerOrderId
    = CustomerOrderId String


type alias CustomerOrderBrief =
    { id : CustomerOrderId, number : String }


customerOrderIdDecoder : Decode.Decoder CustomerOrderId
customerOrderIdDecoder =
    string |> Decode.map CustomerOrderId


customerOrderBriefDecoder : Decode.Decoder CustomerOrderBrief
customerOrderBriefDecoder =
    Decode.succeed CustomerOrderBrief
        |> required "id" customerOrderIdDecoder
        |> required "number" string
