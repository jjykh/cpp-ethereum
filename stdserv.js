env.note('Creating Config...')
var configCode = eth.lll("{
  [[69]] (caller)
  (returnlll
    (when (= (caller) @@69)
      (for {} (< @i (calldatasize)) [i](+ @i 64)
        [[ (calldataload @i) ]] (calldataload (+ @i 32))
      )
    )
  )
}")
env.note('Config code: ' + configCode.unbin())
var config = "0x9ef0f0d81e040012600b0c1abdef7c48f720f88a";
eth.create(eth.key, '0', configCode, 10000, eth.gasPrice, function(a) { config = a; })

env.note('Config at address ' + config)

var nameRegCode = eth.lll("{
  [[(address)]] 'NameReg
  [['NameReg]] (address)
  [[" + config + "]] 'Config
  [['Config]] " + config + "
  [[69]] (caller)
  (returnlll
    (if (calldatasize)
      {
        (when @@(calldataload 0) (stop))
        (when @@(caller) [[@@(caller)]] 0)
        [[(calldataload 0)]] (caller)
        [[(caller)]] (calldataload 0)
      }
      {
        (when (= (caller) @@69) (suicide (caller)))
        (when @@(caller) {
          [[@@(caller)]] 0
          [[(caller)]] 0
        })
      }
    )
  )
}");
env.note('NameReg code: ' + nameRegCode.unbin())

var nameReg = "0x3face8f2b3ef580265f0f67a57ce0fb78b135613";
env.note('Create NameReg...')
eth.create(eth.key, '0', nameRegCode, 10000, eth.gasPrice, function(a) { nameReg = a; })

env.note('NameReg at address ' + nameReg)

env.note('Register NameReg...')
eth.transact(eth.key, '0', config, "0".pad(32) + nameReg.pad(32), 10000, eth.gasPrice);

var gavCoinCode = eth.lll("{
  [[ (caller) ]]: 0x1000000
  (call (- (gas) 100) " + nameReg + " 0 0 (lit 0 'GavCoin) 0 0)
  (returnlll {
    (when (!= (calldatasize) 64) (stop))
    [fromBal] @@(caller)
    [toBal]: @@(calldataload 0)
    [value]: (calldataload 32)
    (when (< @fromBal @value) (stop))
    [[ (caller) ]]: (- @fromBal @value)
    [[ (calldataload 0) ]]: (+ @toBal @value)
  })
}");

env.note('Create GavCoin...')
eth.create(eth.key, '0', gavCoinCode, 10000, eth.gasPrice);

env.note('All done.')

// env.load('/home/gav/Eth/cpp-ethereum/stdserv.js')
