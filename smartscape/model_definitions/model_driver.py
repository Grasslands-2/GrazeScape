from ctypes import cdll
lib = cdll.LoadLibrary('./libbird_model.so')
# lib = cdll.LoadLibrary('./libfoo.so')

class Foo(object):
    def __init__(self):
        self.obj = lib.BirdModel_new()
        # self.obj = lib.Foo_new()

    def bar(self):
        lib.BirdModel_run_model(self.obj)
        # lib.Foo_bar(self.obj)
f = Foo()
f.bar() #and you will see "Hello" on the screen