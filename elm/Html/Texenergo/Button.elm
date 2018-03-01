module Html.Texenergo.Button exposing (..)

import Html exposing (div, text, h1)
import Html.Attributes exposing (class)


type alias Button =
    { icon : String
    , title : String
    }


render : String -> String -> Html.Html msg
render icon title =
    div
        [ class "btn btn-success"
        ]
        [ Html.i
            [ "fa fa-" ++ icon |> class
            ]
            []
        , text title
        ]
