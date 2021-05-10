def ignore_no_data(value):
    print(value)
    print(value == -9999)
    if value == -9999:
        return float("NAN")
    return value