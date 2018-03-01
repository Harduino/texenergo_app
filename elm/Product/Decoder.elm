module Product.Decoder
    exposing
        ( productDecoder
        , productIdToString
        )

import Product.Model exposing (ProductId(..), Product)
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)


productIdToString : ProductId -> String
productIdToString (ProductId str) =
    str


productDecoder : Decode.Decoder Product
productDecoder =
    Decode.succeed Product
        |> required "id" (string |> Decode.map ProductId)
        |> required "name" string
        |> required "article" string
