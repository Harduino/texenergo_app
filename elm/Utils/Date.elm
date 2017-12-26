module Utils.Date exposing (decoder, toHuman)

import Date exposing (Date)
import Json.Decode as Decode exposing (Decoder)


toDecoder : Result String b -> Decoder b
toDecoder res =
    case res of
        Err error ->
            Decode.fail error

        Ok value ->
            Decode.succeed value


decoder : Decoder Date
decoder =
    Decode.andThen
        (toDecoder << Date.fromString)
        Decode.string


monthDigit : Date.Month -> String
monthDigit m =
    case m of
        Date.Jan ->
            "01"

        Date.Feb ->
            "02"

        Date.Mar ->
            "03"

        Date.Apr ->
            "04"

        Date.May ->
            "05"

        Date.Jun ->
            "06"

        Date.Jul ->
            "07"

        Date.Aug ->
            "08"

        Date.Sep ->
            "09"

        Date.Oct ->
            "10"

        Date.Nov ->
            "11"

        Date.Dec ->
            "12"


toHuman : Date -> String
toHuman d =
    -- 01/06/17 13:40
    (Date.day d |> toString)
        ++ "/"
        ++ (Date.month d |> monthDigit)
        ++ "/"
        ++ (Date.year d |> toString |> String.right 2)
        ++ " "
        ++ (Date.hour d |> toString)
        ++ ":"
        ++ (Date.minute d |> toString |> (++) "0" |> String.right 2)
