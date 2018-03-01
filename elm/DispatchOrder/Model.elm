module DispatchOrder.Model
    exposing
        ( DispatchOrder
        , DispatchOrderId(..)
        , initDispatchOrder
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


initDispatchOrder : DispatchOrder
initDispatchOrder =
    DispatchOrder (DispatchOrderId "") (Date.fromTime 0.0) "" 0.0 ""
