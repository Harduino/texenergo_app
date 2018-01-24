module Html.Texenergo exposing (..)

import Html exposing (div, text, h1)
import Html.Attributes exposing (class)

pageHeader : String -> Html.Html msg
pageHeader t = 
  h1 [ class "page-title txt-color-blueDark ng-binding" ] [
    Html.i [ class "fa-fw fa fa-book" ] [],
    text t
  ]