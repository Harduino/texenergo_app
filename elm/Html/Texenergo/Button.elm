module Html.Texenergo.Button exposing (button, render, backButton)

import Html exposing (div, text, h1)
import Html.Attributes exposing (class)


backButton : String -> Html.Html msg
backButton path =
    Html.a
        [ class "btn btn-success"
        , Html.Attributes.href path
        ]
        [ Html.i [ class "fa fa-arrow-left" ] []
        , text "Назад"
        ]


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


button : List (Html.Attribute msg) -> List (Html.Html msg) -> String -> String -> Html.Html msg
button attributes values icon title =
    div
        ([ class "btn btn-success"
         ]
            ++ attributes
        )
        ([ Html.i
            [ "fa fa-" ++ icon |> class
            ]
            []
         , text title
         ]
            ++ values
        )
