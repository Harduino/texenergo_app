port module Texenergo.Ports exposing (..)


port setDat : (String -> msg) -> Sub msg


port setPicker : String -> Cmd msg
