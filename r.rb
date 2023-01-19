
s = gets.chomp 
p = "atcoder" 
n = p.size
k = []

for i in 0..6
  k << s.index(p[i])
end

ans = 0

for i in 0..6
  for j in 1..(7-i-1)
    if k[j-1] > k[j]
      k[j-1],k[j] = k[j],k[j-1]
      ans += 1
    end
  end
end

puts ans