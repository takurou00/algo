
n, x = gets.split.map(&:to_i)
ans = 1
n.times {
  a, b = gets.split.map(&:to_i)
  ans = (ans << a) | (ans << b)
  p ans 
}
puts ans[x] == 1 ? 'Yes' : 'No'

