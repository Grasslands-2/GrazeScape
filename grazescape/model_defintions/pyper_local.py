#!/usr/bin/env python
'''
         PypeR (PYthon-piPE-R)

PypeR is free software subjected to the GPL license 3.0. and comes with
ABSOLUTELY NO WARRANT. This package provides a light-weight interface to use R
in Python by pipe.  It can be used on multiple platforms since it is written in
pure python.

Prerequisites:
    1. Python 2.3 or later is required.

Usage:
    The usage of this packages is very simple. Examples are presented in the
    file "test.py" in the distribution package.

    PypeR provide a class "R" to wrap the R language. An instance of the R
    class is used to manage an R process. Different instances can use different
    R installations. On POSIX systems (including the Cygwin environment on
    Windows), it is even possible to use an R installed on a remote computer.

    Basicly, there are four ways to use an instance of the R class.

    1. Use the methods of the instance
        methods include:
            run:This method is used to pass an R command string to the R process,
                the return value is a string - the standard output from R. Note
                that the return value usually includes the R expression (a
                series of R codes) themselves and the output of the R
                expression.  If the real result value is wanted, use the
                function "get" instead.
            assign: Assign a value to an R variable. No return value.
            get: Get the result of an R expression.
            remove: Remove a R variable.

    2. Call the instance as a function
        The instance is callable. If called as a function, it behaves just
        same as its "run" method.

    3. Use the instance as a Python dictionary
        The instance can mimic some operations on a python dictionary,
        typically, to assign values to R variables, to retrieve values for any
        R expression, or delete an R variable. These two operations do same
        jobs as the methods "assign", "get", and "remove".

    4. Access R variables as if they are the attributes of the instance.
        If the variable name cannot be found in the instance or its class, the
        instance will try to get/set/remove it in R. This way is similar to 3,
        but with more limitations, e.g., the R variable name cannot contain any
        DOT (.)

    Considering that any code block in R is an expression, the "get" method (or
    the form of retrieving values from a dictionary) can be used to run a
    number of R commands with the final result returned.

    Note that PypeR do NOT validate/convert a variable name when pass it to R.
    If a variable name with a leading underscore ("_"), although it legal in
    python, is passed to R, an RError will be raised.

Conversions:
    Python -> R
        None -> NULL, NaN -> NaN, Inf -> Inf
    R -> Python (numpy)
        NULL -> None, NA -> None, NaN -> None (NaN), Inf -> None (Inf)

DEBUG model:
    Since the child process (R) can be easily killed by any ocassional error in
    the codes passed to it, PypeR is set to "DEBUG" model by default. This
    means that any code blocks send to R will be wrapped in the function
    "try()", which will prevent R from crashing. To disable the "DEBUG" model,
    the user can simple set the variable "_DEBUG_MODE" in the R class or in its
    instance to False.

    To model the behavior of the "get" method of a Python dictionary, the
    method "get" allows wild values for variables that does not exists in R.
    Then the R expression will always be wrapped in "try()" to avoid R crashing
    if the method "get" is called.
'''

# the module "subprocess" requires Python 2.4

import os
import sys
import time
import re
import tempfile
from types import *

__version__ = '1.1.2'

if sys.version < '2.3':  # actually python >= 2.3 is required by tempfile.mkstemp used in this module !!!
    set = frozenset = tuple
    basestring = str
elif sys.version < '2.4':
    from sets import Set as set, ImmutableSet as frozenset

if sys.version < '3.0':
    _mystr = _mybytes = lambda s: s
    _in_py3 = False
else:
    from functools import reduce

    long, basestring, unicode = int, str, str
    _mybytes = lambda s: bytes(s, 'utf8')  # 'ascii')
    _mystr = lambda s: str(s, 'utf8')
    _in_py3 = True
try:
    import pandas

    has_pandas = True
except:
    has_pandas = False
try:
    import numpy

    has_numpy = True
except:
    has_numpy = False

_has_subp = False
if sys.platform == 'cli':  # for IronPython
    from System.Diagnostics import Process

    PIPE, _STDOUT = None, None


    def Popen(CMD, *a, **b):
        '''
        CMD is a list - a command and its arguments
        '''
        p = Process()
        p.StartInfo.UseShellExecute = False
        p.StartInfo.RedirectStandardInput = True
        p.StartInfo.RedirectStandardOutput = True
        p.StartInfo.RedirectStandardError = True
        p.StartInfo.FileName = CMD[0]
        p.StartInfo.Arguments = ' '.join(CMD[1:])
        p.Start()
        return (p)


    def sendAll(p, s):
        # remove ending newline since WriteLine will add newline at the end of s!
        if s.endswith('\r\n'):
            s = s[:-2]
        elif s.endswith('\n'):
            s = s[:-1]
        p.StandardInput.WriteLine(_mybytes(s))


    def readLine(p, dump_stdout=False, *a, **b):
        rv = _mystr(p.StandardOutput.ReadLine()) + '\n'  # add newline since ReadLine removed it.
        if dump_stdout:
            sys.stdout.write(rv)
            sys.stdout.flush()
        return (rv)

else:

    try:
        import subprocess

        _has_subp = True
        Popen, PIPE, _STDOUT = subprocess.Popen, subprocess.PIPE, subprocess.STDOUT
    except:  # Python 2.3 or older
        PIPE, _STDOUT = None, None


        def Popen(CMD, *a, **b):
            class A:
                None

            p = A()
            p.stdin, p.stdout = os.popen4(' '.join(CMD))
            return (p)


    def sendAll(p, s):
        p.stdin.write(_mybytes(s))
        # os.write(p.stdin.fileno(), s)
        p.stdin.flush()


    def readLine(p, dump_stdout=False, *a, **b):
        rv = _mystr(p.stdout.readline())
        if dump_stdout:
            sys.stdout.write(rv)
            sys.stdout.flush()
        return (rv)


def NoneStr(obj): return ('NULL')


def BoolStr(obj):
    return (obj and 'TRUE' or 'FALSE')


def ReprStr(obj):
    return (repr(obj))


if has_numpy:
    def FloatStr(f):
        if f is numpy.NaN or f is numpy.nan:
            return ('NaN')  # or 'NA'
        if has_pandas and pandas.isnull(f):
            return ('NaN')
        if numpy.isposinf(f):
            return ('Inf')
        if numpy.isneginf(f):
            return ('-Inf')
        return (repr(f))
else:
    FloatStr = repr


def LongStr(obj):
    rv = repr(obj)
    if rv[-1] == 'L':
        rv = rv[:-1]
    return (rv)


def ComplexStr(obj):
    return (repr(obj).replace('j', 'i'))


def UniStr(obj):
    return (repr(obj.encode('utf8')))


def ByteStr(obj):
    return (repr(obj)[1:])
    # return obj.decode()


def SeqStr(obj, head='c(', tail=')', enclose=True):
    if not enclose:  # don't add head and tail
        return (','.join(map(Str4R, obj)))
    if not obj:
        return (head + tail)
    # detect types
    if isinstance(obj, set):
        obj = list(obj)
    obj0 = obj[0]
    tp0 = type(obj0)
    simple_types = [str, bool, int, long, float, complex]
    num_types = [int, long, float, complex]
    is_int = tp0 in (
        int, long)  # token for explicit converstion to integer in R since R treat an integer from stdin as double
    if tp0 not in simple_types:
        head = 'list('
    else:
        tps = isinstance(obj0, basestring) and [StringType] or isinstance(obj0, bool) and [BooleanType] or num_types
        for i in obj[1:]:
            tp = type(i)
            if tp not in tps:
                head = 'list('
                is_int = False
                break
            elif is_int and tp not in (int, long):
                is_int = False
    # convert
    return ((is_int and 'as.integer(' or '') + head + ','.join(map(Str4R, obj)) + tail + (is_int and ')' or ''))


def DictStr(obj):
    return ('list(' + ','.join(['%s=%s' % (Str4R(a[0]), Str4R(a[1])) for a in obj.items()]) + ')')


# 'b':boolean, 'i':integer, 'u':unsigned int, 'f':float, c complex-float
# 'S'/'a':string, 'U':unicode, 'V':raw data. 'O':string?
_tpdic = {'i': 'as.integer(c(%s))', 'u': 'as.integer(c(%s))', 'f': 'as.double(c(%s))', 'c': 'as.complex(c(%s))',
          'b': 'c(%s)', 'S': 'c(%s)', 'a': 'c(%s)', 'U': 'c(%s)', 'V': 'list(%s)', 'O': 'as.character(c(%s))'}


def getVec(ary):
    # used for objects from numpy and pandas
    tp = ary.dtype.kind
    if len(ary.shape) > 1:
        ary = ary.reshape(reduce(lambda a, b=1: a * b, ary.shape))
    ary = ary.tolist()
    if tp != 'V':
        return (_tpdic.get(tp, 'c(%s)') % SeqStr(ary, enclose=False))
    # record array
    ary = list(map(SeqStr, ary))  # each record will be mapped to vector or list
    return (_tpdic.get(tp, 'list(%s)') % (
        ', '.join(ary)))  # use str here instead of repr since it has already been converted to str by SeqStr


def NumpyNdarrayStr(obj):
    shp = obj.shape
    if len(shp) == 1:  # to vector
        tp = obj.dtype
        if tp.kind != 'V':
            return (getVec(obj))

        # One-dimension record array will be converted to data.frame
        def mapField(f):
            ary = obj[f]
            tp = ary.dtype.kind
            return ('"%s"=%s' % (f, _tpdic.get(tp, 'list(%s)') % SeqStr(ary.tolist(), enclose=False)))

        return ('data.frame(%s)' % (', '.join(map(mapField, tp.names))))
    elif len(shp) == 2:  # two-dimenstion array will be converted to matrix
        return ('matrix(%s, nrow=%d, byrow=TRUE)' % (getVec(obj), shp[0]))
    else:  # to array
        dim = list(shp[-2:])  # row, col
        dim.extend(shp[-3::-1])
        newaxis = list(range(len(shp)))
        newaxis[-2:] = [len(shp) - 1, len(shp) - 2]
        return ('array(%s, dim=c(%s))' % (getVec(obj.transpose(newaxis)), repr(dim)[1:-1]))


def PandasSerieStr(obj):
    return ('data.frame(%s=%s, row.names=%s)' % (obj.name, getVec(obj.values), getVec(obj.index)))


def PandasDataFrameStr(obj):
    # DataFrame will be converted to data.frame, have to explicitly name columns
    # return 'data.frame(%s, row.names=%s)' % (', '.join(map(lambda a,b=obj:a+'='+getVec(obj[a]), obj)), getVec(obj.index))
    s = ', '.join(map(lambda a, b=obj: '"%s"=%s' % (str(a), getVec(obj[a])), obj))
    return ('data.frame(%srow.names=%s)' % (s and s + ', ', getVec(obj.index)))
    s = ''
    for col in obj:
        s = s + col + '=' + getVec(obj[col]) + ', '
    # print 'data.frame(%s row.names=%s)' % (s, getVec(obj.index))
    return ('data.frame(%s row.names=%s)' % (s, getVec(obj.index)))


def OtherStr(obj):
    if hasattr(obj, '__iter__'):  # for iterators
        if hasattr(obj, '__len__') and len(obj) <= 10000:
            return (SeqStr(list(obj)))
        else:  # waiting for better solution for huge-size containers
            return (SeqStr(list(obj)))
    return (repr(obj))


str_func = {type(None): NoneStr, bool: BoolStr, long: LongStr, int: repr, float: FloatStr, complex: ComplexStr,
            unicode: UniStr, str: repr, list: SeqStr, tuple: SeqStr, set: SeqStr, frozenset: SeqStr,
            dict: DictStr}  # str will override uncode in Python 3

base_tps = [type(None), bool, int, long, float, complex, str, unicode, list, tuple, set, frozenset,
            dict]  # use type(None) instead of NoneType since the latter cannot be found in the types module in Python 3
if has_numpy:
    str_func[numpy.ndarray] = NumpyNdarrayStr
    base_tps.append(numpy.ndarray)
if has_pandas:
    str_func.update({pandas.Series: PandasSerieStr, pandas.DataFrame: PandasDataFrameStr})
    base_tps.extend([pandas.Series, pandas.DataFrame])
base_tps.reverse()

if _in_py3:
    base_tps.append(bytes)
    str_func[bytes] = ByteStr


def Str4R(obj):
    '''
    convert a Python basic object into an R object in the form of string.
    '''
    # return str_func.get(type(obj), OtherStr)(obj)
    # for objects known by PypeR
    if type(obj) in str_func:
        return (str_func[type(obj)](obj))
    # for objects derived from basic data types
    for tp in base_tps:
        if isinstance(obj, tp):
            return (str_func[tp](obj))
    # for any other objects
    return (OtherStr(obj))


class RError(Exception):
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return (repr(self.value))


class R(object):  # "del r.XXX" fails on FePy-r7 (IronPython 1.1 on .NET 2.0.50727.42) if using old-style class
    '''
    A Python class to enclose an R process.
    '''
    __Rfun = r'''.getRvalue4Python__ <- function(x, use_dict=NULL, has_numpy=FALSE, has_pandas=FALSE) {
    if (has_pandas) has_numpy <- TRUE
    if (has_numpy) {
        headstr <- 'numpy.array('
        tailstr <- ')' }
    else headstr <- tailstr <- ''
    SpecialLocs <- function(x) { # find locations of special values: NULL, NA, NaN, Inf
        rlt <- list()
        if (!has_numpy) {
            idx <- which(is.null(x) | is.na(x) | is.nan(x) | is.infinite(x))
            if (length(idx) > 0) list$None <- idx
            }
        else {
            idx <- which(is.null(x) | is.na(x))
            if (length(idx) > 0) rlt$None <- idx
            idx <- which(is.nan(x))
            if (length(idx) > 0) rlt$numpy.NaN <- idx
            idx <- which(is.infinite(x))
            if (length(idx) > 0) {
                v <- x[idx]
                iidx <- which(v > 0)
                if (length(iidx) > 0) rlt$numpy.Inf <- idx[iidx]
                iidx <- which(v < 0)
                if (length(iidx) > 0) rlt['-numpy.Inf'] <- idx[iidx]
                }
            }
        return(rlt)
        }
    SpecialVals <- function(x, valoc) {
        for (val in names(valoc)) x[valoc[[val]]] <- val
        return(x)
        }
    NullStr <- function(x) 'None'
    VectorStr <- function(x) {
        #nms <- names(x)
        #if (!is.null(nms) &&  length(nms)>0) return(ListStr(as.list(x)))
        complx <- is.complex(x)
        special_locs <- SpecialLocs(x)
        if (is.character(x)) {
            x <- gsub('\\\\', '\\\\\\\\', x)
            x <- gsub('"', '\\\\"', x)
            x <- paste('"', x, '"', sep='') }
        else if (is.logical(x)) x <- ifelse(x, 'True', 'False')
        if (length(special_locs) > 0) x <- SpecialVals(x, special_locs)
        if (length(x)==1) x <- paste(x) # convert to character using paste, "gettext", or "as.character"
        else x <- paste(headstr, '[', paste(x, collapse=','), ']', tailstr, sep='')
        if (complx) x <- gsub('i', 'j', x)
        return(x) }
    MatrixStr <- function(x) {
        complx <- is.complex(x)
        special_locs <- SpecialLocs(x)
        if (is.character(x)) x <- matrix(paste('"', x, '"', sep=''), nrow=nrow(x))
        else if (is.logical(x)) x <- ifelse(x, 'True', 'False')
        if (length(special_locs) > 0) x <- SpecialVals(x, special_locs)
        x <- apply(x, 1, function(r) paste('[', paste(r, collapse=','), ']', sep=''))
        x <- paste(headstr, '[', paste(x, collapse=','), ']', tailstr, sep='')
        if (complx) x <- gsub('i', 'j', x)
        return(x) }
    ArrayStr <- function(x) {
        complx <- is.complex(x)
        ndim <- length(dim(x))
        if (ndim == 1) return(VectorStr(x))
        if (ndim == 2) return(MatrixStr(x))
        # ndim >= 3
        if (is.character(x)) x <- array(paste('"', x, '"', sep=''), dim=dim(x))
        else if (is.logical(x)) x <- ifelse(x, 'True', 'False')
        # do col first
        x <- apply(x, seq(dim(x))[-2], function(r) paste('[', paste(r, collapse=','), ']', sep=''))
        for (i in seq(ndim-2))
            x <- apply(x, seq(dim(x))[-1], function(r) paste('[', paste(r, collapse=','), ']', sep=''))
        x <- paste(headstr, '[', paste(x, collapse=','), ']', tailstr, sep='')
        if (complx) x <- gsub('i', 'j', x)
        return(x) }
    DataFrameStr <- function(x) {
        if (ncol(x) == 0) {
            if (has_pandas) return('pandas.DataFrame()')
            if (has_numpy) return('numpy.array([])') 
            return('[]')}
        if (has_numpy) {
            cnms <- colnames(x) # get column names
            ctp <- list()
            for (i in seq(x)) {
                xi <- as.vector(x[[i]])
                special_locs <- SpecialLocs(xi)
                if (is.character(xi)) {
                    ctp[i] <- sprintf('("%s", "|S%d")', cnms[i], if (length(xi) > 0) max(nchar(xi)) else 0 )
                    xi <- paste('"', xi, '"', sep='') }
                else if (is.logical(xi)) {
                    xi <- ifelse(xi, 'True', 'False')
                    ctp[i] <- paste('("', cnms[i], '", "<?")' ) }
                else if (is.integer(xi)) {
                    xi <- paste(xi)
                    ctp[i] <- paste('("', cnms[i], '", "<q")' ) }
                else if (is.double(xi)) {
                    xi <- paste(xi)
                    ctp[i] <- paste('("', cnms[i], '", "<g")' ) }
                else if (is.complex(xi)) {
                    xi <- gsub('i', 'j', paste(xi))
                    ctp[i] <- paste('("', cnms[i], '", "<G")') }
                if (length(special_locs) > 0) xi <- SpecialVals(xi, special_locs)
                if (nrow(x) > 0) x[[i]] <- xi }
            tailstr <- paste(', dtype=[', paste(ctp, collapse=','), ']', tailstr, sep='') }
        else if (nrow(x) > 0) 
            for (i in seq(x)) {
                xi <- as.vector(x[[i]])
                special_locs <- SpecialLocs(xi)
                if (is.character(xi)) xi <- paste('"', xi, '"', sep='') 
                else if (is.logical(xi)) xi <- ifelse(xi, 'True', 'False')
                else if (is.integer(xi)) xi <- paste(xi)
                else if (is.double(xi)) xi <- paste(xi)
                else if (is.complex(xi)) xi <- gsub('i', 'j', paste(xi))
                if (length(special_locs) > 0) xi <- SpecialVals(xi, special_locs)
                if (nrow(x) > 0) x[[i]] <- xi }
        x <- as.matrix(x)
        x <- apply(x, 1, function(r) paste('(', paste(r, collapse=','), if(length(r)<2) ',)' else ')', sep=''))
        x <- paste(headstr, '[', paste(x, collapse=','), ']', tailstr, sep='')
        if (has_pandas) x <- paste('pandas.DataFrame(', x, ')', sep='')
        return(x) }
    ListStr <- function(x) {
        nms <- names(x) # get column names
        x <- sapply(x, Str4Py)
        return(zipVecWithName(x, nms))}
    zipVecWithName <- function(x, nms) {
        if (!is.null(nms) &&  length(nms)>0) {
            nms <- paste('"', nms, '"', sep='')
            x <- sapply(seq(nms), function(i) paste('(', nms[i], ',', x[i], ')') ) 
            if (identical(use_dict, TRUE)) x <- paste('dict([', paste(x, collapse=','), '])', sep='')
            else if (identical(use_dict, FALSE))  x <- paste('[', paste(x, collapse=','), ']', sep='')
            else { # should be NULL or something else
                if (any(duplicated(nms))) x <- paste('[', paste(x, collapse=','), ']', sep='') 
                else x <- paste('dict([', paste(x, collapse=','), '])', sep='') } }
        else x <- paste('[', paste(x, collapse=','), ']', sep='')
        return(x) }
    Str4Py <- function(x) {
        # no considering on NA, Inf, ...
        # use is.XXX, typeof, class, mode, storage.mode, sprintf
        if (is.factor(x)) x <- as.vector(x)
        rlt <- {
            if (is.null(x)) NullStr(x)
            else if (is.vector(x) && !is.list(x)) VectorStr(x)
            else if (is.matrix(x) || is.array(x)) ArrayStr(x)
            else if (is.data.frame(x)) DataFrameStr(x)
            else if (is.list(x)) ListStr(x)
            else Str4Py(as.character(x)) } # other objects will be convert to character (instead of NullStr), or use "gettext"
        return(rlt) }
    Str4Py(x) }
    # initalize library path for TCL/TK based environment on Windows, e.g. Python IDLE
    .addLibs <- function() {
        ruser <- Sys.getenv('R_USER')
        userpath <- Sys.getenv('R_LIBS_USER')
        libpaths <- .libPaths()
        for (apath in userpath) {
            if (length(grep(apath, libpaths)) > 0) next
            if (file.exists(apath)) .libPaths(apath)
            else {
                d <- '/Documents'
                if (substr(ruser, nchar(ruser)-nchar(d)+1, nchar(ruser)) != d) {
                    apath <- paste(ruser,d, substr(apath, nchar(ruser)+1, nchar(apath)), sep='')
                    if (file.exists(apath)) .libPaths(apath)} } } }
    if(identical(.Platform$OS.type, 'windows')) .addLibs()
    rm(.addLibs)
    '''
    _DEBUG_MODE = True

    def __init__(self, RCMD='R', max_len=1000, use_numpy=True, use_pandas=True, use_dict=None,
                 host='localhost', user=None, ssh='ssh', return_err=True, dump_stdout=False):
        '''
        RCMD: The name of a R interpreter, path information should be included
            if it is not in the system search path.
        use_numpy: Used as a boolean value. A False value will disable numpy
            even if it has been imported.
        use_pandas: Used as a boolean value. A False value will disable pandas
            even if it has been imported.
        use_dict: A R named list will be returned as a Python dictionary if
            "use_dict" is True, or a list of tuples (name, value) if "use_dict"
            is False. If "use_dict" is None, the return value will be a
            dictionary if there is no replicated names, or a list if replicated
            names found.
        host: The computer name (or IP) on which the R interpreter is
            installed. The value "localhost" means that R locates on the the
            localhost computer. On POSIX systems (including Cygwin environment
            on Windows), it is possible to use R on a remote computer if the
            command "ssh" works. To do that, the user needs to set this value,
            and perhaps the parameter "user".
        user: The user name on the remote computer. This value needs to be set
            only if the user name on the remote computer is different from the
            local user. In interactive environment, the password can be input
            by the user if prompted. If running in a program, the user needs to
            be able to login without typing password!
        ssh: The program to login to remote computer.
        return_err: redirect stderr to stdout
        dump_stdout:
            prints output from R directly to sys.stdout, useful for long running
            routines which print progress during execution.
        '''
        # use self.__dict__.update to register variables since __setattr__ is
        # used to set variables for R.  tried to define __setattr in the class,
        # and change it to __setattr__ for instances at the end of __init__,
        # but it seems failed.
        # -- maybe this only failed in Python2.5? as warned at
        # http://wiki.python.org/moin/NewClassVsClassicClass:
        # "Warning: In 2.5, magic names (typically those with a double
        # underscore (DunderAlias) at both ends of the name) may look at the
        # class rather than the instance even for old-style classes."
        self.__dict__.update({'prog': None,
                              'has_numpy': use_numpy and has_numpy,
                              'has_pandas': use_pandas and has_pandas,
                              'Rfun': self.__class__.__Rfun,
                              'max_len': max_len,
                              'use_dict': use_dict,
                              'dump_stdout': dump_stdout,
                              'localhost': host == 'localhost',
                              'newline': sys.platform == 'win32' and '\r\n' or '\n',
                              'sendAll': sendAll
                              # keep a reference to the global function "sendAll" which will be used by __del__
                              })
        RCMD = [RCMD]  # shlex.split(RCMD) - shlex do not work properly on Windows! #re.split(r'\s', RCMD)
        if not self.localhost:
            RCMD.insert(0, host)
            if user:
                RCMD.insert(0, '-l%s' % user)
            RCMD.insert(0, ssh)
        # args = ('--vanilla',) # equal to --no-save, --no-restore, --no-site-file, --no-init-file and --no-environ
        args = ('--quiet', '--no-save', '--no-restore')  # "--slave" cannot be used on Windows!
        for arg in args:
            if arg not in RCMD:
                RCMD.append(arg)
        if _has_subp and hasattr(subprocess, 'STARTUPINFO'):
            info = subprocess.STARTUPINFO()
            try:
                if hasattr(subprocess, '_subprocess'):
                    info.dwFlags |= subprocess._subprocess.STARTF_USESHOWWINDOW
                    info.wShowWindow = subprocess._subprocess.SW_HIDE
                else:
                    info.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                    info.wShowWindow = subprocess.SW_HIDE
            except:
                info = None
        else:
            info = None
        # create stderr to replace None for py2exe:
        # http://www.py2exe.org/index.cgi/Py2ExeSubprocessInteractions
        if sys.platform != 'win32':
            childstderr = None
        else:
            if hasattr(sys.stderr, 'fileno'):
                childstderr = sys.stderr
            elif hasattr(sys.stderr, '_file') and hasattr(sys.stderr._file, 'fileno'):
                childstderr = sys.stderr._file
            else:  # Give up and point child stderr at nul
                childstderr = file('nul', 'a')
        # print("start up info", info)
        self.__dict__['prog'] = Popen(RCMD, stdin=PIPE, stdout=PIPE, stderr=return_err and _STDOUT or childstderr,
                                      startupinfo=info)
        self.__call__(self.Rfun)

    def __runOnce(self, CMD, use_try=None):
        '''
        CMD: a R command string
        '''
        use_try = use_try or self._DEBUG_MODE
        newline = self.newline
        tail_token = 'R command at time: %s' % repr(time.time())
        # tail_token_r = re.sub(r'[\(\)\.]', r'\\\1', tail_token)
        tail_cmd = 'print("%s")%s' % (tail_token, newline)
        tail_token = tail_token.replace(' ', '\\s').replace('.', '\\.').replace('+', '\\+')
        re_tail = re.compile(r'>\sprint\("%s"\)\r?\n\[1\]\s"%s"\r?\n$' % (tail_token, tail_token))
        if len(CMD) <= self.max_len or not self.localhost:
            fn = None
            CMD = (use_try and 'try({%s})%s%s' or '%s%s%s') % (CMD.replace('\\', '\\\\'), newline, tail_cmd)
        else:
            fh, fn = tempfile.mkstemp()
            os.fdopen(fh, 'wb').write(_mybytes(CMD))
            if sys.platform == 'cli':
                os.close(fh)  # this is necessary on IronPython
            fn = fn.replace('\\', '/')
            CMD = (use_try and 'try({source("%s")})%sfile.remove(%r)%s%s' or '%s%s%s') % (
                fn, newline, fn, newline, tail_cmd)
        self.sendAll(self.prog, CMD)
        rlt = ''
        while not re_tail.search(rlt):
            try:
                rltonce = readLine(self.prog, dump_stdout=self.dump_stdout)
                if rltonce:
                    rlt = rlt + rltonce
            except:
                break
        else:
            rlt = re_tail.sub('', rlt)
            if rlt.startswith('> '):
                rlt = rlt[2:]
        # if fn is not None: os.unlink(fn)
        return (rlt)

    def __call__(self, CMDS=[], use_try=None):
        '''
        Run a (list of) R command(s), and return the output message from the STDOUT of R.

        CMDS: an R command string or a list of R commands
        '''
        rlt = []
        if isinstance(CMDS, basestring):  # a single command
            rlt.append(self.__runOnce(CMDS, use_try=use_try))
        else:  # should be a list of commands
            # for CMD in CMDS:
            #   rlt.append(self.__runOnce(CMD, use_try=use_try))
            rlt.append(self.__runOnce('; '.join(CMDS),
                                      use_try=use_try))  # now, ['sink("output.txt")', ..., 'sink()'] is allowed!
        if len(rlt) == 1:
            rlt = rlt[0]
        return (rlt)

    def __getitem__(self, obj, use_try=None, use_dict=None):  # to model a dict: "r['XXX']"
        '''
        Get the value of an R variable or expression. The return value is
        converted to the corresponding Python object.

        obj: a string - the name of an R variable, or an R expression
        use_try: use "try" function to wrap the R expression. This can avoid R
            crashing if the obj does not exist in R.
        use_dict: named list will be returned a dict if use_dict is True,
            otherwise it will be a list of tuples (name, value)
        '''
        if obj.startswith('_'):
            raise RError('Leading underscore ("_") is not permitted in R variable names!')
        use_try = use_try or self._DEBUG_MODE
        if use_dict is None:
            use_dict = self.use_dict
        cmd = '.getRvalue4Python__(%s, use_dict=%s, has_numpy=%s, has_pandas=%s)' % (
            obj, use_dict is None and 'NULL' or use_dict and 'TRUE' or 'FALSE', self.has_numpy and 'TRUE' or 'FALSE',
            self.has_pandas and 'TRUE' or 'FALSE')
        rlt = self.__call__(cmd, use_try=use_try)
        head = (use_try and 'try({%s})%s[1] ' or '%s%s[1] ') % (cmd, self.newline)
        # sometimes (e.g. after "library(fastICA)") the R on Windows uses '\n' instead of '\r\n'
        head = rlt.startswith(head) and len(head) or len(head) - 1
        tail = rlt.endswith(self.newline) and len(rlt) - len(self.newline) or len(rlt) - len(
            self.newline) + 1  # - len('"')
        try:
            rlt = eval(eval(rlt[head:tail]))  # The inner eval remove quotes and recover escaped characters.
        except:
            raise RError(rlt)
        return (rlt)

    def __setitem__(self, obj, val):  # to model a dict: "r['XXX'] = YYY"
        '''
        Assign a value (val) to an R variable (obj).

        obj: a string - the name of an R variable
        val: a python object - the value to be passed to an R object
        '''
        if obj.startswith('_'):
            raise RError('Leading underscore ("_") is not permitted in R variable names!')
        self.__call__('%s <- %s' % (obj, Str4R(val)))

    def __delitem__(self, obj):  # to model a dict: "del r['XXX']"
        if obj.startswith('_'):
            raise RError('Leading underscore ("_") is not permitted in R variable names!')
        self.__call__('rm(%s)' % obj)

    def __del__(self):  # to model "del r"
        if self.prog:
            try:
                self.sendAll(self.prog, 'q("no")' + self.newline)
            except:
                pass
            # self.prog = None
        print("terminating process")
        print(self.prog)

        # self.prog.terminate()
        self.prog.communicate()
        print(self.prog)
        self.prog.wait()
        print("Process return code", self.prog.returncode)
        # stdout, stderr = self.prog.communicate()
        # print(stdout, stderr)

    def __getattr__(self, obj, use_dict=None):  # to model object attribute: "r.XXX"
        '''
        obj: a string - the name of an R variable
        use_dict: named list will be returned a dict if use_dict is True,
            otherwise it will be a list of tuples (name, value)
        '''
        # Overriding __getattr__ is safer than __getattribute__ since it is
        # only called as a last resort i.e. if there are no attributes in the
        # instance that match the name
        if obj in self.__dict__:
            return (self.__dict__[obj])
        if obj in self.__class__.__dict__:
            return (self.__class__.__dict__[obj])
        try:
            if use_dict is None:
                use_dict = self.use_dict
            rlt = self.__getitem__(obj, use_dict=use_dict)
        except:
            raise  # RError('No this object!')
        return (rlt)

    def __setattr__(self, obj, val):  # to model object attribute: "r.XXX = YYY"
        if obj in self.__dict__ or obj in self.__class__.__dict__:  # or obj.startswith('_'):
            self.__dict__[obj] = val  # for old-style class
            # object.__setattr__(self, obj, val) # for new-style class
        else:
            self.__setitem__(obj, val)

    def __delattr__(self, obj):  # to model object attribute: "del r.XXX"
        if obj in self.__dict__:
            del self.__dict__[obj]
        else:
            self.__delitem__(obj)

    def get(self, obj, default=None, use_dict=None):  # to model a dict: "r.get('XXX', 'YYY')"
        '''
        obj: a string - the name of an R variable, or an R expression
        default: a python object - the value to be returned if failed to get data from R
        use_dict: named list will be returned a dict if use_dict is True,
            otherwise it will be a list of tuples (name, value). If use_dict is
            None, the value of self.use_dict will be used instead.
        '''
        try:
            rlt = self.__getitem__(obj, use_try=True, use_dict=use_dict)
        except:
            if True:  # val is not None:
                rlt = default
            else:
                raise RError('No this object!')
        return (rlt)

    run, assign, remove = __call__, __setitem__, __delitem__


# for a single-round duty:
def runR(CMDS, Robj='R', max_len=1000, use_numpy=True, use_pandas=True, use_dict=None, host='localhost', user=None,
         ssh='ssh'):
    '''
    Run a (list of) R command(s), and return the output from the STDOUT.

    CMDS: a R command string or a list of R commands.
    Robj: can be a shell command (like /usr/bin/R), or the R class.
    max_len: define the upper limitation for the length of command string. A
        command string will be passed to R by a temporary file if it is longer
        than this value.
    use_numpy: Used as a boolean value. A False value will disable numpy even
        if it has been imported.
    use_pandas: Used as a boolean value. A False value will disable pandas even
        if it has been imported.
    use_dict: named list will be returned a dict if use_dict is True, otherwise
        it will be a list of tuples (name, value).
    host: The computer name (or IP) on which the R interpreter is
        installed. The value "localhost" means that the R locates on the
        the localhost computer. On POSIX systems (including Cygwin
        environment on Windows), it is possible to use R on a remote
        computer if the command "ssh" works. To do that, the user need set
        this value, and perhaps the parameter "user".
    user: The user name on the remote computer. This value need to be set
        only if the user name is different on the remote computer. In
        interactive environment, the password can be input by the user if
        prompted. If running in a program, the user need to be able to
        login without typing password!
    ssh: The program to login to remote computer.
    '''
    if isinstance(Robj, basestring):
        Robj = R(RCMD=Robj, max_len=max_len, use_numpy=use_numpy, use_pandas=use_pandas, use_dict=use_dict, host=host,
                 user=user, ssh=ssh, dump_stdout=dump_stdout)
    rlt = Robj.run(CMDS=CMDS)
    if len(rlt) == 1:
        rlt = rlt[0]
    return (rlt)


