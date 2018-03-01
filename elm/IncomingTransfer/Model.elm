module IncomingTransfer.Model
    exposing
        ( IncomingTransfer
        , IncomingTransferId(..)
        , initIncomingTransfer
        , incomingTransferIdToString
        )

import Date exposing (Date)


type IncomingTransferId
    = IncomingTransferId String


type alias IncomingTransfer =
    { id : IncomingTransferId
    , date : Date
    , number : String
    , total : Float
    , partnerId : String
    }


incomingTransferIdToString : IncomingTransferId -> String
incomingTransferIdToString (IncomingTransferId str) =
    str


initIncomingTransfer : IncomingTransfer
initIncomingTransfer =
    IncomingTransfer (IncomingTransferId "") (Date.fromTime 0.0) "" 0.0 ""
