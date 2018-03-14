port module Texenergo.Ports exposing (..)


port setDat : (String -> msg) -> Sub msg


port setPicker : String -> Cmd msg


port toJsSetTinyMce : String -> Cmd msg


port toJsGetTinyMce : String -> Cmd msg


port fromJsTinyMceContent : (String -> msg) -> Sub msg
