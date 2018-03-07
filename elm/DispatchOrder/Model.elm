module DispatchOrder.Model
    exposing
        ( DispatchOrder
        , DispatchOrderId(..)
        , initDispatchOrder
        , dispatchOrderIdToString
        )

import Date exposing (Date)


type DispatchOrderId
    = DispatchOrderId String


type alias DispatchOrder =
    { id : DispatchOrderId
    , date : Date
    , number : String
    , total : Float
    , partnerId : String
    }


dispatchOrderIdToString : DispatchOrderId -> String
dispatchOrderIdToString (DispatchOrderId x) =
    x


initDispatchOrder : DispatchOrder
initDispatchOrder =
    DispatchOrder (DispatchOrderId "") (Date.fromTime 0.0) "" 0.0 ""
