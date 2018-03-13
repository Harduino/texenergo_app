module IncomingTransfer.Model
    exposing
        ( IncomingTransfer
        , IncomingTransferId(..)
        , initIncomingTransfer
        , incomingTransferIdToString
        , incomingTransferPath
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


incomingTransferPath : IncomingTransferId -> String
incomingTransferPath (IncomingTransferId x) =
    "/#/incoming_transfers/" ++ x


incomingTransferIdToString : IncomingTransferId -> String
incomingTransferIdToString (IncomingTransferId str) =
    str


initIncomingTransfer : IncomingTransfer
initIncomingTransfer =
    IncomingTransfer (IncomingTransferId "") (Date.fromTime 0.0) "" 0.0 ""
